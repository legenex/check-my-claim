import { useMemo } from "react";

export function useValidation(survey, steps, fields) {
  const fieldKeys = useMemo(() => new Set((fields || []).map(f => f.key)), [fields]);
  const stepIds = useMemo(() => new Set((steps || []).map(s => s.id)), [steps]);

  const errors = useMemo(() => {
    if (!survey || !steps) return [];
    const errs = [];

    // 1. start_step_id resolves
    if (survey.start_step_id && !stepIds.has(survey.start_step_id)) {
      errs.push({ stepId: null, message: `start_step_id "${survey.start_step_id}" does not resolve to any step.` });
    }

    steps.forEach(step => {
      const sid = step.id;

      // 2. else_target_step_id must resolve if set
      if (step.else_target_step_id && !stepIds.has(step.else_target_step_id)) {
        errs.push({ stepId: sid, message: `else_target_step_id "${step.else_target_step_id}" not found.` });
      }

      // 3. branching_rules target_step_id
      (step.branching_rules || []).forEach((rule, i) => {
        if (rule.target_step_id && !stepIds.has(rule.target_step_id)) {
          errs.push({ stepId: sid, message: `Branching rule ${i + 1}: target "${rule.target_step_id}" not found.` });
        }
      });

      // 4. save_to_field must exist
      if (step.save_to_field && !fieldKeys.has(step.save_to_field)) {
        errs.push({ stepId: sid, message: `save_to_field "${step.save_to_field}" not in field library.` });
      }

      // 5. option_field_writes keys must exist
      const ofw = step.option_field_writes || {};
      Object.entries(ofw).forEach(([optVal, writes]) => {
        (writes || []).forEach(w => {
          if (w.field && !fieldKeys.has(w.field)) {
            errs.push({ stepId: sid, message: `option_field_writes for "${optVal}": field "${w.field}" not found.` });
          }
        });
      });

      // 6. Lookup steps need tier_selector_map
      if (step.type === "lookup") {
        const lc = step.lookup_config || {};
        if (!lc.tier_selector_map || Object.keys(lc.tier_selector_map).length === 0) {
          errs.push({ stepId: sid, message: `Lookup step has no tier_selector_map.` });
        }
      }
    });

    return errs;
  }, [survey, steps, fields, fieldKeys, stepIds]);

  return errors;
}