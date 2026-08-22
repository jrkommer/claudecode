import { DIVORCE_ABOUT_TEXT } from '../data/divorcePreset';
import { Card, SectionTitle } from './ui';

export function AboutPage() {
  return (
    <div className="space-y-6">
      <Card>
        <SectionTitle title="What this tool is" />
        <p className="mb-3 text-lg font-medium italic text-slate-800 dark:text-slate-100">
          "{DIVORCE_ABOUT_TEXT.premise}"
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Crossroads is a structured thinking tool for major life decisions — it doesn't diagnose, predict, or
          decide anything. It takes what you enter about what you value, how each option scores against those
          values, and how likely you think each option is to go well, and it does arithmetic on that. The output is
          only ever a mirror of your own inputs. If a result surprises you, that's a signal to interrogate the
          inputs, not to treat the number as a verdict.
        </p>
      </Card>

      <Card>
        <SectionTitle title="Safety first" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Before any modeling begins, a short safety screen checks for immediate danger, self-harm risk, or
          abuse/coercion. Situations like those need a person, not a spreadsheet, so the tool routes to real crisis
          resources instead of proceeding. The evidence journal also watches for repeated "coercion/pressure"
          entries and will surface those same resources again if that pattern shows up later.
        </p>
      </Card>

      <Card>
        <SectionTitle title="About the examples" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{DIVORCE_ABOUT_TEXT.disclosure}</p>
      </Card>

      <Card>
        <SectionTitle title="Base rates and research hints" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The reference figures shown beside probability inputs come from general, publicly cited research
          literature. They are outside-view anchors meant to counter overconfidence — not predictions about your
          specific situation. Reputable estimates for things like post-affair outcomes or divorce rates vary
          noticeably by study, population, and definition; treat every figure here as a rough, contestable range,
          not a fact.
        </p>
      </Card>

      <Card>
        <SectionTitle title="Local-first & privacy" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Everything you enter is stored only in this browser's local storage. There is no account, no server, and
          nothing is transmitted anywhere unless you explicitly export a backup file yourself. Clearing your
          browser data or switching devices means starting over unless you've exported a backup first.
        </p>
      </Card>
    </div>
  );
}
