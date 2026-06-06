import { HONMONO_APPS } from "@/lib/constants";

export function InternalLinks() {
  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-lg font-bold mb-4">HONMONOシリーズ</h2>
      <p className="text-sm text-muted mb-4">
        HONMONOが提供する「本物」を見つけるためのツール群をご活用ください。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {HONMONO_APPS.map((app) => (
          <a
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 p-4 border border-border rounded-lg hover:shadow-md transition-shadow bg-surface"
          >
            <span className="text-2xl flex-shrink-0">{app.emoji}</span>
            <div>
              <h3 className="font-bold text-sm text-foreground">{app.name}</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                {app.description}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
