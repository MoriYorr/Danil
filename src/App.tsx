import { useState, useCallback, useRef, useMemo } from 'react';

// Типы категорий файлов
interface FileCategory {
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  extensions: string[];
  folder: string;
}

interface FileItem {
  name: string;
  size: number;
  type: string;
  extension: string;
  category: string;
  lastModified: Date;
}

interface SortPlan {
  category: string;
  folder: string;
  files: FileItem[];
  icon: string;
  color: string;
}

// Категории файлов
const CATEGORIES: FileCategory[] = [
  {
    name: 'Документы',
    icon: '📄',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx', 'csv'],
    folder: 'Документы',
  },
  {
    name: 'Изображения',
    icon: '🖼️',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff', 'psd', 'ai'],
    folder: 'Изображения',
  },
  {
    name: 'Видео',
    icon: '🎬',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    extensions: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'],
    folder: 'Видео',
  },
  {
    name: 'Аудио',
    icon: '🎵',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
    folder: 'Аудио',
  },
  {
    name: 'Архивы',
    icon: '📦',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg'],
    folder: 'Архивы',
  },
  {
    name: 'Код',
    icon: '💻',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    extensions: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'h', 'css', 'html', 'json', 'xml', 'yaml', 'yml', 'sh', 'bat', 'sql', 'rb', 'go', 'rs', 'php'],
    folder: 'Код',
  },
  {
    name: 'Программы',
    icon: '⚙️',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    extensions: ['exe', 'msi', 'deb', 'rpm', 'apk', 'app', 'bin'],
    folder: 'Программы',
  },
  {
    name: 'Шрифты',
    icon: '🔤',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    extensions: ['ttf', 'otf', 'woff', 'woff2', 'eot'],
    folder: 'Шрифты',
  },
];

// Форматирование размера файла
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 Б';
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Определение категории файла
function getCategory(extension: string): FileCategory {
  const ext = extension.toLowerCase();
  return (
    CATEGORIES.find((cat) => cat.extensions.includes(ext)) || {
      name: 'Другое',
      icon: '📁',
      color: 'text-slate-600',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      extensions: [],
      folder: 'Другое',
    }
  );
}

// Демо-данные для показа возможностей
const DEMO_FILES: FileItem[] = [
  { name: 'отчёт_2024.pdf', size: 2457600, type: 'application/pdf', extension: 'pdf', category: 'Документы', lastModified: new Date('2024-12-01') },
  { name: 'фото_отпуск.jpg', size: 4812800, type: 'image/jpeg', extension: 'jpg', category: 'Изображения', lastModified: new Date('2024-11-15') },
  { name: 'презентация.pptx', size: 8945664, type: 'application/vnd.ms-powerpoint', extension: 'pptx', category: 'Документы', lastModified: new Date('2024-11-20') },
  { name: 'видео_урок.mp4', size: 157286400, type: 'video/mp4', extension: 'mp4', category: 'Видео', lastModified: new Date('2024-10-05') },
  { name: 'архив_проекта.zip', size: 52428800, type: 'application/zip', extension: 'zip', category: 'Архивы', lastModified: new Date('2024-12-10') },
  { name: 'песня.mp3', size: 7340032, type: 'audio/mpeg', extension: 'mp3', category: 'Аудио', lastModified: new Date('2024-09-22') },
  { name: 'скриншот.png', size: 1048576, type: 'image/png', extension: 'png', category: 'Изображения', lastModified: new Date('2024-12-12') },
  { name: 'установщик.exe', size: 35651584, type: 'application/x-msdownload', extension: 'exe', category: 'Программы', lastModified: new Date('2024-08-30') },
  { name: 'заметки.txt', size: 4096, type: 'text/plain', extension: 'txt', category: 'Документы', lastModified: new Date('2024-12-14') },
  { name: 'таблица_данных.xlsx', size: 524288, type: 'application/vnd.ms-excel', extension: 'xlsx', category: 'Документы', lastModified: new Date('2024-12-08') },
  { name: 'логотип.svg', size: 32768, type: 'image/svg+xml', extension: 'svg', category: 'Изображения', lastModified: new Date('2024-11-01') },
  { name: 'скрипт.py', size: 8192, type: 'text/x-python', extension: 'py', category: 'Код', lastModified: new Date('2024-12-13') },
];

export default function App() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [dryRun, setDryRun] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Обработка файлов
  const processFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: FileItem[] = Array.from(fileList).map((file) => {
      const ext = file.name.split('.').pop() || '';
      const category = getCategory(ext);
      return {
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        category: category.name,
        lastModified: new Date(file.lastModified),
      };
    });
    setFiles(newFiles);
    setExecuted(false);
    setExpandedCategories(new Set());
  }, []);

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  // Загрузка через input
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        processFiles(e.target.files);
      }
    },
    [processFiles]
  );

  // Демо-данные
  const loadDemo = useCallback(() => {
    setFiles(DEMO_FILES);
    setShowDemo(true);
    setExecuted(false);
    setExpandedCategories(new Set());
  }, []);

  // План сортировки
  const sortPlan: SortPlan[] = useMemo(() => {
    const plan: SortPlan[] = [];
    const grouped = new Map<string, FileItem[]>();

    files.forEach((file) => {
      if (!grouped.has(file.category)) {
        grouped.set(file.category, []);
      }
      grouped.get(file.category)!.push(file);
    });

    grouped.forEach((catFiles, categoryName) => {
      const category = CATEGORIES.find((c) => c.name === categoryName) || {
        name: 'Другое',
        icon: '📁',
        color: 'text-slate-600',
        bgColor: 'bg-slate-50',
        borderColor: 'border-slate-200',
        folder: 'Другое',
      };
      plan.push({
        category: categoryName,
        folder: category.folder,
        files: catFiles,
        icon: category.icon,
        color: category.color,
      });
    });

    return plan.sort((a, b) => b.files.length - a.files.length);
  }, [files]);

  // Общая статистика
  const stats = useMemo(() => {
    const totalSize = files.reduce((acc, f) => acc + f.size, 0);
    const totalFiles = files.length;
    const categories = new Set(files.map((f) => f.category)).size;
    return { totalSize, totalFiles, categories };
  }, [files]);

  // Выполнить сортировку (симуляция)
  const executeSort = useCallback(() => {
    setExecuted(true);
  }, []);

  // Сброс
  const reset = useCallback(() => {
    setFiles([]);
    setExecuted(false);
    setShowDemo(false);
    setExpandedCategories(new Set());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Переключение категории
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg shadow-lg shadow-blue-500/20">
              📂
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Раскладчик Загрузки</h1>
              <p className="text-xs text-slate-500">Сортировка файлов по типам</p>
            </div>
          </div>
          {files.length > 0 && (
            <button
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              ✕ Сбросить
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Безопасный режим - баннер */}
        <div className={`mb-6 rounded-2xl border-2 p-4 flex items-center gap-4 transition-all ${
          dryRun 
            ? 'bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100' 
            : 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
            dryRun ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {dryRun ? '🛡️' : '⚡'}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold ${dryRun ? 'text-emerald-800' : 'text-amber-800'}`}>
              {dryRun ? 'Безопасный режим: Только предпросмотр' : 'Режим выполнения'}
            </h3>
            <p className={`text-sm ${dryRun ? 'text-emerald-600' : 'text-amber-600'}`}>
              {dryRun 
                ? 'Файлы НЕ будут перемещены. Вы увидите план сортировки без риска потери данных.' 
                : 'При подтверждении файлы будут распределены по папкам.'}
            </p>
          </div>
          <button
            onClick={() => setDryRun(!dryRun)}
            className={`relative w-14 h-7 rounded-full transition-all ${
              dryRun ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all ${
                dryRun ? 'left-0.5' : 'left-7'
              }`}
            />
          </button>
        </div>

        {/* Зона загрузки */}
        {files.length === 0 && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-3xl border-3 border-dashed p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-blue-400 bg-blue-50 scale-[1.02] shadow-xl shadow-blue-100'
                : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <div className={`text-6xl mb-4 transition-transform ${isDragOver ? 'scale-110' : ''}`}>
              {isDragOver ? '📥' : '📁'}
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">
              {isDragOver ? 'Отпустите файлы здесь!' : 'Перетащите файлы из папки «Загрузки»'}
            </h2>
            <p className="text-slate-500 mb-4">или нажмите, чтобы выбрать файлы</p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-100 rounded-full">PDF</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">JPG</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">MP4</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">ZIP</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">DOCX</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">MP3</span>
              <span className="px-2 py-1 bg-slate-100 rounded-full">и другие...</span>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadDemo();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all hover:scale-105"
              >
                🎯 Загрузить демо-данные
              </button>
            </div>
          </div>
        )}

        {/* Статистика и план */}
        {files.length > 0 && (
          <>
            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg">📊</div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.totalFiles}</p>
                    <p className="text-xs text-slate-500">файлов</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-lg">💾</div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{formatSize(stats.totalSize)}</p>
                    <p className="text-xs text-slate-500">общий размер</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg">📁</div>
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{stats.categories}</p>
                    <p className="text-xs text-slate-500">категорий</p>
                  </div>
                </div>
              </div>
            </div>

            {/* План сортировки */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dryRun ? '📋' : '🚀'}</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {dryRun ? 'План сортировки (предпросмотр)' : 'Готово к выполнению'}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {dryRun 
                        ? 'Ничего не будет перемещено — это только план' 
                        : `${sortPlan.length} папок будут созданы, ${stats.totalFiles} файлов распределены`}
                    </p>
                  </div>
                </div>
                {!dryRun && !executed && (
                  <button
                    onClick={executeSort}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all hover:scale-105"
                  >
                    ✓ Подтвердить
                  </button>
                )}
                {executed && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium">
                    <span>✅</span> Выполнено!
                  </div>
                )}
              </div>

              {/* Дерево папок */}
              <div className="p-5 space-y-3">
                {/* Корневая папка */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <span>📂</span>
                  <span className="font-mono">~/Загрузки/</span>
                </div>

                {sortPlan.map((plan, index) => (
                  <div key={plan.category} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <div
                      onClick={() => toggleCategory(plan.category)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                        executed 
                          ? 'bg-green-50 border-green-200' 
                          : `${plan.color.includes('blue') ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' : ''}
                             ${plan.color.includes('green') ? 'bg-green-50 border-green-200 hover:bg-green-100' : ''}
                             ${plan.color.includes('purple') ? 'bg-purple-50 border-purple-200 hover:bg-purple-100' : ''}
                             ${plan.color.includes('pink') ? 'bg-pink-50 border-pink-200 hover:bg-pink-100' : ''}
                             ${plan.color.includes('amber') ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' : ''}
                             ${plan.color.includes('cyan') ? 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' : ''}
                             ${plan.color.includes('gray') ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : ''}
                             ${plan.color.includes('indigo') ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' : ''}
                             ${plan.color.includes('slate') ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' : ''}`
                      }`}
                    >
                      <span className="text-xl">{plan.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-700">{plan.folder}/</span>
                          <span className="text-xs px-2 py-0.5 bg-white/80 rounded-full text-slate-500">
                            {plan.files.length} {plan.files.length === 1 ? 'файл' : plan.files.length < 5 ? 'файла' : 'файлов'}
                          </span>
                          {executed && <span className="text-green-500 text-sm">✓</span>}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatSize(plan.files.reduce((acc, f) => acc + f.size, 0))}
                        </p>
                      </div>
                      <span className={`text-slate-400 transition-transform ${expandedCategories.has(plan.category) ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </div>

                    {/* Раскрытый список файлов */}
                    {expandedCategories.has(plan.category) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {plan.files.map((file) => (
                          <div
                            key={file.name}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                              executed ? 'bg-green-50/50' : 'bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{plan.icon}</span>
                              <span className="text-slate-700 font-mono text-xs truncate max-w-[200px] sm:max-w-[300px]">
                                {file.name}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {formatSize(file.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Стрелка перемещения */}
                    {index < sortPlan.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-4 bg-slate-200"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Предупреждение */}
            {dryRun && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  🛡️
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-800 mb-1">Безопасный режим активен</h3>
                  <p className="text-sm text-emerald-600">
                    Это лишь предпросмотр того, как файлы будут распределены. 
                    Ни один файл не был перемещён или удалён. 
                    Переключите режим выше, чтобы выполнить сортировку.
                  </p>
                </div>
              </div>
            )}

            {/* Результат выполнения */}
            {executed && (
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-green-800 mb-2">Сортировка завершена!</h3>
                <p className="text-sm text-green-600 mb-4">
                  {stats.totalFiles} файлов распределены по {stats.categories} папкам. 
                  Общий размер: {formatSize(stats.totalSize)}
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {sortPlan.map((plan) => (
                    <span key={plan.category} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white rounded-full text-sm border border-green-200">
                      <span>{plan.icon}</span>
                      <span className="text-slate-700">{plan.folder}/</span>
                      <span className="text-slate-400">({plan.files.length})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Как это работает */}
        {files.length === 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                📥
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">1. Загрузите файлы</h3>
              <p className="text-sm text-slate-500">
                Перетащите файлы или выберите их. Мы проанализируем расширения и типы.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                🛡️
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">2. Предпросмотр</h3>
              <p className="text-sm text-slate-500">
                По умолчанию — режим «только показать». Вы увидите план без рисков.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                📂
              </div>
              <h3 className="font-semibold text-slate-800 mb-2">3. Сортировка</h3>
              <p className="text-sm text-slate-500">
                Подтвердите план — и файлы будут аккуратно разложены по папкам.
              </p>
            </div>
          </div>
        )}

        {/* Категории-справка */}
        {files.length === 0 && (
          <div className="mt-12">
            <h3 className="text-center text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
              Распознаваемые типы файлов
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${cat.bgColor} ${cat.borderColor}`}
                >
                  <span>{cat.icon}</span>
                  <span className={`text-sm font-medium ${cat.color}`}>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-slate-200 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-slate-400">
          <p>🛡️ Безопасный раскладчик папки «Загрузки» — сортирует, но не удаляет</p>
        </div>
      </footer>
    </div>
  );
}
