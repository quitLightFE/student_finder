import { act, useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Phone,
  Copy,
  Check,
  GraduationCap,
  X,
  Loader,
} from "lucide-react";
import type { Student } from "./types";
import { getStudents } from "./api";

// const students: Student[] = [
//   {
//     id: 1,
//     name: "Иванов Иван Иванович",
//     group: "УГЦ 26-04",
//     phone: "+998 90 123-45-67",
//   },
//   {
//     id: 2,
//     name: "Петрова Анна Сергеевна",
//     group: "УГЦ 26-03",
//     phone: "+998 91 234-56-78",
//   },
//   {
//     id: 3,
//     name: "Сидоров Алексей",
//     group: "УГЦ 26-04",
//     phone: "+998 93 345-67-89",
//   },
// ];

export default function App() {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("Все группы");
  const [copied, setCopied] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const data = await getStudents();

        if (active) {
          setStudents(data);
          setError("");
        }
      } catch {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    const interval = setInterval(loadStudents, 60_000);
    setLoading(false);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const groups = useMemo(
    () => [...new Set(students.map((student) => student.group))].sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();

    return students.filter((student) => {
      const matchesGroup = group === "Все группы" || student.group === group;

      const matchesQuery =
        student.name.toLocaleLowerCase().includes(search) ||
        student.group.toLocaleLowerCase().includes(search) ||
        student.phone.includes(search);

      return matchesGroup && matchesQuery;
    });
  }, [students, query, group]);

  async function copyPhone(student: Student) {
    try {
      await navigator.clipboard.writeText(student.phone);
      setCopied(student.id);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      alert("Не удалось скопировать. Проверь разрешение браузера.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          <div className="rounded-xl bg-blue-600 p-2.5 text-white">
            <GraduationCap size={25} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Студенты</h1>
            <p className="text-sm text-slate-500">
              Справочник групп и контактов
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold tracking-tight">Найти студента</h2>
          <p className="mt-1 text-sm text-slate-500">
            Поиск по ФИО, группе или номеру телефона
          </p>
        </div>

        <div className="relative mb-3">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например, Иванов или УГЦ 26-04"
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-11 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Очистить поиск"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setGroup("Все группы")}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              group === "Все группы"
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            Все группы
          </button>

          {groups.map((item) => (
            <button
              key={item}
              onClick={() => setGroup(item)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                group === item
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm text-slate-500">Результаты поиска</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users size={16} />
            {filteredStudents.length}
          </span>
        </div>
        <div className="space-y-3">
          {error && <p>{error}</p>}
          {filteredStudents.map((student) => (
            <article
              key={student.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <h3 className="font-semibold leading-6">{student.name}</h3>

              <span className="mt-2 inline-block rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {student.group}
              </span>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex min-w-0 items-center gap-2">
                  <Phone size={17} className="shrink-0 text-slate-400" />
                  <span className="truncate text-sm font-medium">
                    {student.phone}
                  </span>
                </div>

                <button
                  onClick={() => copyPhone(student)}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    copied === student.id
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {copied === student.id ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                  {copied === student.id ? "Скопировано" : "Копировать"}
                </button>
              </div>
            </article>
          ))}

          {filteredStudents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader
                    size={28}
                    className="spin mx-auto mb-3 text-slate-400"
                  />
                  <p className="font-medium text-slate-500">
                    Ищем студентов...
                  </p>
                </div>
              ) : (
                <>
                  <Search size={28} className="mx-auto mb-3 text-slate-400" />
                  <p className="font-medium">Студенты не найдены</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Проверь ФИО, номер или выбранную группу
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Студенческий справочник
        </p>
      </section>
    </main>
  );
}
