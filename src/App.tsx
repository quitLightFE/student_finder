import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Phone,
  Copy,
  Check,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import type { Student } from "./types";
import { getStudents } from "./api";
import logo from "/favicon.svg";

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
          setError("Не удалось загрузить список студентов.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStudents();

    const interval = window.setInterval(() => {
      void loadStudents();
    }, 60_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const groups = useMemo(
    () =>
      [...new Set(students.map((student) => student.group))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "ru")),
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

      window.setTimeout(() => {
        setCopied((current) => (current === student.id ? null : current));
      }, 1500);
    } catch {
      window.alert(
        "Не удалось скопировать номер. Проверь разрешение браузера.",
      );
    }
  }

  function normalizePhoneNumber(phoneNumber: string): string {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, "");

    if (cleanNumber.startsWith("998") && cleanNumber.length === 12) {
      return `+${cleanNumber}`;
    }

    if (!cleanNumber.startsWith("+998") && cleanNumber.length === 9) {
      return `+998${cleanNumber}`;
    }

    return cleanNumber;
  }

  const hasFilters = query.trim() !== "" || group !== "Все группы";

  return (
    <main className="min-h-screen bg-[#f7f7f9] text-[#202127] antialiased">
      {/* Header */}
      <header className="border-b border-[#e5e6eb] bg-white">
        <div className="mx-auto flex h-[68px] max-w-5xl items-center px-4 sm:px-6">
          <a
            href="/"
            className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5]"
            aria-label="Студенческий справочник — главная"
          >
            <img
              src={logo}
              alt=""
              width={36}
              height={36}
              className="shrink-0 rounded-lg"
            />

            <div>
              <p className="text-[15px] font-semibold tracking-[-0.3px]">
                Студенты
              </p>
              <p className="mt-0.5 text-xs text-[#858898]">
                Справочник групп и контактов
              </p>
            </div>
          </a>
        </div>
      </header>

      {/* Main content */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6 sm:pt-12">
        {/* Page heading */}
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#7775c9]">
            STUDENT DIRECTORY
          </p>

          <h1 className="text-[26px] font-semibold leading-tight tracking-[-1px] sm:text-[32px]">
            Поиск студентов
          </h1>

          <p className="mt-2 max-w-lg text-sm leading-6 text-[#626575]">
            Найдите студента по имени, группе или номеру телефона.
          </p>
        </div>

        {/* Search */}
        <div className="mb-5 rounded-xl border border-[#e5e6eb] bg-white p-2 shadow-[0_1px_2px_rgba(20,20,40,0.03)] transition-colors focus-within:border-[#8585f5] focus-within:ring-4 focus-within:ring-[#eeeeff]">
          <div className="flex min-h-11 items-center gap-3 px-2">
            <Search
              size={19}
              strokeWidth={1.8}
              className="shrink-0 text-[#858898]"
              aria-hidden="true"
            />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя студента или группа..."
              aria-label="Поиск по имени, группе или номеру телефона"
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-[#202127] outline-none placeholder:text-[#a0a2af] sm:text-sm"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Очистить поиск"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-[#858898] transition-colors hover:bg-[#f2f3f6] hover:text-[#202127] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5]"
              >
                <X size={17} />
              </button>
            )}
          </div>
        </div>

        {/* Group filters */}
        <div className="mb-7">
          {/* Родительский контейнер, который создает эффект затухания по бокам */}
          <div
            className="relative w-full"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 20px), transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, #000 20px, #000 calc(100% - 20px), transparent)",
            }}
          >
            <div
              className="flex gap-2 overflow-x-auto pb-2"
              aria-label="Фильтр по группам"
            >
              {["Все группы", ...groups].map((item) => {
                const selected = group === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setGroup(item)}
                    aria-pressed={selected}
                    className={`flex min-h-10 shrink-0 items-center rounded-lg border px-3.5 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5] focus-visible:ring-offset-2 ${
                      selected
                        ? "border-[#dadafa] bg-[#eeeeff] text-[#4949b5]"
                        : "border-[#e5e6eb] bg-white text-[#626575] hover:border-[#d2d4dd] hover:bg-[#f6f6fa] hover:text-[#202127]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results heading */}
        <div className="mb-3 flex min-h-9 items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#202127]">Результаты</h2>

          {!loading && !error && (
            <span className="flex items-center gap-2 text-xs text-[#858898]">
              <Users size={15} aria-hidden="true" />
              {filteredStudents.length}{" "}
              {filteredStudents.length === 1
                ? "студент"
                : filteredStudents.length >= 2 && filteredStudents.length <= 4
                  ? "студента"
                  : "студентов"}
            </span>
          )}
        </div>
        {/* Results container */}
        <div className="overflow-hidden rounded-xl border border-[#e5e6eb] bg-white">
          {/* Loading */}
          {loading && (
            <div
              className="flex min-h-52 flex-col items-center justify-center px-5 py-12"
              role="status"
            >
              <LoaderCircle
                size={24}
                className="mb-3 animate-spin text-[#7775c9]"
              />
              <p className="text-sm font-medium text-[#626575]">
                Загружаем студентов...
              </p>
              <p className="mt-1 text-xs text-[#858898]">
                Это займёт несколько секунд
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex min-h-52 flex-col items-center justify-center px-5 py-10 text-center">
              <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-[#fff0f0] text-[#c03636]">
                <RefreshCw size={19} />
              </div>

              <p className="text-sm font-semibold text-[#202127]">
                Не удалось загрузить данные
              </p>

              <p className="mt-1 max-w-sm text-sm leading-6 text-[#626575]">
                Проверьте подключение к интернету и попробуйте обновить
                страницу.
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#5b5bd6] px-4 text-sm font-medium text-white transition-colors hover:bg-[#4b4bc4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5] focus-visible:ring-offset-2"
              >
                <RefreshCw size={15} />
                Повторить
              </button>
            </div>
          )}

          {/* Empty / no results */}
          {!loading && !error && filteredStudents.length === 0 && (
            <div className="flex min-h-56 flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl border border-[#e5e6eb] bg-[#f7f7f9] text-[#858898]">
                <Search size={21} strokeWidth={1.7} />
              </div>

              <h3 className="text-sm font-semibold text-[#202127]">
                {students.length === 0
                  ? "Список студентов пуст"
                  : "Ничего не найдено"}
              </h3>

              <p className="mt-1 max-w-sm text-sm leading-6 text-[#626575]">
                {students.length === 0
                  ? "Данные пока недоступны. Попробуйте обновить список позже."
                  : "Проверьте написание имени или попробуйте поиск по другой группе."}
              </p>

              {hasFilters && students.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setGroup("Все группы");
                  }}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e5e6eb] px-3.5 text-sm font-medium text-[#626575] transition-colors hover:bg-[#f6f6fa] hover:text-[#202127] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5]"
                >
                  <X size={15} />
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}

          {/* Student rows */}
          {!loading &&
            !error &&
            filteredStudents.map((student, index) => {
              const isCopied = copied === student.id;
              const phone = student.phone ?? "";
              const hasPhone = phone.trim().length > 0;
              return (
                <article
                  key={student.id}
                  className={`group px-4 py-4 transition-colors duration-150 hover:bg-[#fafafd] sm:px-5 ${
                    index > 0 ? "border-t border-[#e5e6eb]" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    {/* Student information */}
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-[14px] font-semibold leading-6 tracking-[-0.15px] text-[#202127]">
                        {student.name}
                      </h3>

                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-md border border-[#e5e6eb] bg-[#f7f7f9] px-2 py-1 text-xs font-medium text-[#626575]">
                          {student.group}
                        </span>
                      </div>
                    </div>

                    {/* Contact information and actions */}
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 border-t border-[#f0f0f3] pt-3 sm:justify-end sm:border-0 sm:pt-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Phone
                          size={16}
                          strokeWidth={1.8}
                          className="shrink-0 text-[#858898]"
                          aria-hidden="true"
                        />

                        {hasPhone ? (
                          <a
                            href={`tel:${normalizePhoneNumber(phone)}`}
                            className="break-all text-sm font-medium text-[#40414b] underline-offset-4 transition-colors hover:text-[#4949b5] hover:underline"
                          >
                            {phone}
                          </a>
                        ) : (
                          <span className="text-sm text-[#858898]">
                            Номер не указан
                          </span>
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void copyPhone(student)}
                          disabled={!hasPhone}
                          aria-label={`Скопировать номер телефона: ${student.name}`}
                          className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8585f5] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
                            isCopied
                              ? "border-[#ccebd9] bg-[#eaf7ef] text-[#18794e]"
                              : "border-[#e5e6eb] bg-white text-[#626575] hover:border-[#d2d4dd] hover:bg-[#f6f6fa] hover:text-[#202127]"
                          }`}
                        >
                          {isCopied ? <Check size={15} /> : <Copy size={15} />}
                          <span>{isCopied ? "Скопировано" : "Копировать"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>

        {/* Footer */}
        <footer className="mt-6 flex flex-col items-center justify-between gap-2 text-xs text-[#858898] sm:flex-row">
          <p>Студенческий справочник</p>
          <p>Поиск и контакты студентов</p>
        </footer>
      </section>
    </main>
  );
}
