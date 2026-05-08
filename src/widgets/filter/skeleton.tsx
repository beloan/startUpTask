export const FilterSkeleton = () => (
  <aside className="md:max-w-2xs w-full md:border border-gray-200 rounded-md md:p-4 h-fit animate-pulse">
    {/* Заголовок + кнопка сброса */}
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-5 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-8 w-24 bg-gray-200 rounded"></div>
    </div>

    <div className="h-[80dvh] overflow-y-auto md:overflow-y-visible px-4 md:p-0 md:h-auto">
      <div className="text-sm flex flex-col gap-4 pt-4">
        {/* Рейтинг */}
        <div>
          <div className="h-5 w-16 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded-full w-full"></div>
          <div className="flex justify-between pt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-3 w-3 bg-gray-200 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Цена */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="h-5 w-12 bg-gray-200 rounded"></div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-9 bg-gray-200 rounded w-full"></div>
            <div className="h-9 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full w-full mt-3"></div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Глобальная категория */}
        <div>
          <div className="h-5 w-36 bg-gray-200 rounded mb-2"></div>
          <div className="h-9 bg-gray-200 rounded w-full"></div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Локальные категории (3 строки) */}
        <div>
          <div className="h-5 w-28 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6"></div>
            <div className="h-6 bg-gray-200 rounded w-4/5"></div>
          </div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Продавцы */}
        <div>
          <div className="h-5 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-9 bg-gray-200 rounded w-full"></div>
        </div>

        <div className="h-px bg-gray-200"></div>

        {/* Чекбоксы */}
        <div className="space-y-2">
          <div className="h-5 w-28 bg-gray-200 rounded"></div>
          <div className="h-6 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  </aside>
);