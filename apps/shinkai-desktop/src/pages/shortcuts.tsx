import { SimpleLayout } from './layout/simple-layout';

const shortcuts = [
  {
    section: 'General',
    items: [
      {
        label: 'Create new chat',
        keys: [['⌘', 'N']],
      },

      {
        label: 'Collapse sidebar',
        keys: [
          ['⌘', 'B'],
          ['Ctrl', 'B'],
        ],
      },
      {
        label: 'Switch to previous AI / Agent',
        keys: [
          ['⌘', '['],
          ['Ctrl', '['],
        ],
      },
      {
        label: 'Switch to next AI / Agent',
        keys: [
          ['⌘', ']'],
          ['Ctrl', ']'],
        ],
      },
    ],
  },
  {
    section: 'Quick Ask',
    items: [
      {
        label: 'Open Quick Ask',
        keys: [['⇧', '⌘', 'J']],
      },
      {
        label: 'Copy to clipboard (Quick Ask)',
        keys: [
          ['⇧', '⌘', 'C'],
          ['⇧', 'Ctrl', 'C'],
        ],
      },
    ],
  },
];

function KeyCombo({ combo }: { combo: string[] }) {
  return (
    <span className="inline-flex gap-1">
      {combo.map((key, i) => (
        <kbd
          key={i}
          className="border-official-gray-780 bg-official-gray-950 rounded border px-2 py-1 font-mono text-xs text-white shadow-sm"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

const ShortcutsPage = () => {
  return (
    <SimpleLayout classname="max-w-xl" title="Shortcuts">
      <p className="text-official-gray-400">
        Here you can view all available keyboard shortcuts for the app.
      </p>
      <div className="space-y-10 py-4">
        {shortcuts.map((section) => (
          <div key={section.section}>
            <h2 className="mt-6 mb-2 text-xl font-medium">{section.section}</h2>
            <hr className="border-official-gray-780 mb-4" />
            <div className="space-y-6">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-base text-white">{item.label}</span>
                  <span className="flex gap-2">
                    {item.keys.map((combo, i) => (
                      <>
                        <KeyCombo key={i} combo={combo} />
                        {i < item.keys.length - 1 && ', '}
                      </>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SimpleLayout>
  );
};

export default ShortcutsPage;
