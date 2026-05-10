import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    // Get all quizzes
    const quizzes = await base44.asServiceRole.entities.Quiz.list();
    let processed = 0;

    for (const quiz of quizzes) {
      // Get runs from yesterday
      const runs = await base44.asServiceRole.entities.DecisionTreeRun.filter({ quiz_id: quiz.id }, '-started_at', 1000);
      const yesterdayRuns = runs.filter(r => r.started_at?.slice(0, 10) === yesterday);

      if (yesterdayRuns.length === 0) continue;

      // Aggregate per node
      const nodeStats = {};
      for (const run of yesterdayRuns) {
        const path = run.path_taken || [];
        for (let i = 0; i < path.length; i++) {
          const step = path[i];
          const nodeId = step.node_id;
          if (!nodeStats[nodeId]) {
            nodeStats[nodeId] = { starts: 0, exits: 0, completes: 0, dwell_total: 0, dwell_count: 0 };
          }
          nodeStats[nodeId].starts++;

          // Dwell time
          if (step.entered_at && step.exited_at) {
            const dwell = (new Date(step.exited_at) - new Date(step.entered_at)) / 1000;
            nodeStats[nodeId].dwell_total += dwell;
            nodeStats[nodeId].dwell_count++;
          }

          // Exit = didn't advance to next step
          if (i === path.length - 1 && !run.is_complete) {
            nodeStats[nodeId].exits++;
          }

          if (run.is_complete) nodeStats[nodeId].completes++;
        }
      }

      // Upsert analytics rows
      for (const [nodeId, stats] of Object.entries(nodeStats)) {
        const dropOffRate = stats.starts > 0 ? (stats.exits / stats.starts) * 100 : 0;
        const avgDwell = stats.dwell_count > 0 ? stats.dwell_total / stats.dwell_count : 0;

        const existing = await base44.asServiceRole.entities.DecisionTreeNodeAnalytics.filter({
          quiz_id: quiz.id,
          node_id: nodeId,
          date: yesterday,
        });

        if (existing.length > 0) {
          await base44.asServiceRole.entities.DecisionTreeNodeAnalytics.update(existing[0].id, {
            starts: stats.starts,
            exits: stats.exits,
            completes: stats.completes,
            drop_off_rate: Math.round(dropOffRate * 10) / 10,
            avg_dwell_seconds: Math.round(avgDwell),
            version: quiz.version || 1,
          });
        } else {
          await base44.asServiceRole.entities.DecisionTreeNodeAnalytics.create({
            quiz_id: quiz.id,
            node_id: nodeId,
            date: yesterday,
            starts: stats.starts,
            exits: stats.exits,
            completes: stats.completes,
            drop_off_rate: Math.round(dropOffRate * 10) / 10,
            avg_dwell_seconds: Math.round(avgDwell),
            version: quiz.version || 1,
          });
        }
        processed++;
      }

      // Update quiz totals
      const allRuns = runs.filter(r => r.started_at);
      await base44.asServiceRole.entities.Quiz.update(quiz.id, {
        total_starts: allRuns.length,
        total_completes: allRuns.filter(r => r.is_complete).length,
        total_qualified: allRuns.filter(r => r.is_qualified).length,
        total_disqualified: allRuns.filter(r => r.is_disqualified).length,
        total_submissions: allRuns.filter(r => r.is_complete).length,
      });
    }

    return Response.json({ success: true, processed, quizzes: quizzes.length, date: yesterday });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});