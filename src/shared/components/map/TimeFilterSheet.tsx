'use client'

import { format, isToday, parse } from 'date-fns'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

import './timeFilterSheet.css'

const YYYY_MM_DD = 'yyyy-MM-dd'
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

export interface TimeFilterDuration {
  id: string
  label: string
}

export interface TimeFilterOptions {
  dates: string[]
  defaults: { date: string; durationId: string }
  durations: TimeFilterDuration[]
}

interface TimeFilterSheetProps {
  isOpen: boolean
  options: TimeFilterOptions
  selectedDate: string
  selectedDurationId: string
  onDateChange: (date: string) => void
  onDurationChange: (durationId: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function formatDateLabel(dateStr: string): string {
  const date = parse(dateStr, YYYY_MM_DD, new Date())
  if (isToday(date)) return '오늘'
  const dayName = DAY_NAMES[date.getDay()]
  return `${format(date, 'M/d')}(${dayName})`
}

export default function TimeFilterSheet({
  isOpen,
  options,
  selectedDate,
  selectedDurationId,
  onDateChange,
  onDurationChange,
  onClose,
  onConfirm
}: TimeFilterSheetProps) {
  if (!isOpen) return null

  const allowedDates = new Set(options.dates)
  const selectedDateObj = selectedDate ? parse(selectedDate, YYYY_MM_DD, new Date()) : null

  const lastDate =
    options.dates.length > 0 ? parse(options.dates[options.dates.length - 1], YYYY_MM_DD, new Date()) : new Date()

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return false
    return !allowedDates.has(format(date, YYYY_MM_DD))
  }

  const handleDateChange = (value: unknown) => {
    if (!value || !(value instanceof Date)) return
    const formatted = format(value, YYYY_MM_DD)
    if (allowedDates.has(formatted)) onDateChange(formatted)
  }

  return (
    <>
      {/* Backdrop — 앱 프레임(480px) 내부에서만 dim. dock 영역은 dim 제외 */}
      <div
        className="fixed inset-x-0 top-0 z-[var(--z-backdrop)] mx-auto w-full max-w-[480px]"
        style={{ bottom: 'var(--dock-height, 0px)' }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      </div>

      {/* Sheet */}
      <div className="bg-bg-white fixed bottom-0 left-1/2 z-[var(--z-sheet)] flex w-full max-w-[480px] -translate-x-1/2 flex-col rounded-t-[24px]">
        {/* Header (62px) */}
        <div className="flex h-[62px] items-center justify-center px-4">
          <h2 className="text-text-strong font-bold" style={{ fontSize: 'var(--font-size-h4)' }}>
            날짜 및 이용시간
          </h2>
        </div>

        {/* Calendar (월 네비게이션 + 날짜 그리드) */}
        <div className="modu-calendar px-4">
          <Calendar
            locale="ko-KR"
            calendarType="gregory"
            value={selectedDateObj}
            onChange={handleDateChange}
            tileDisabled={tileDisabled}
            minDate={new Date()}
            maxDate={lastDate}
            formatDay={(_, date) => String(date.getDate())}
            formatShortWeekday={(_, date) => DAY_NAMES[date.getDay()]}
            formatMonthYear={(_, date) => `${date.getFullYear()}년 ${date.getMonth() + 1}월`}
            prev2Label={null}
            next2Label={null}
            showNeighboringMonth={true}
          />
        </div>

        {/* Duration chips — 2행 4열 */}
        <div className="px-6 pt-4 pb-2">
          <p className="text-text-strong mb-3 font-semibold" style={{ fontSize: 'var(--font-size-t3)' }}>
            주차 예정 시간
          </p>
          <div className="grid grid-cols-4 gap-2">
            {options.durations.map((dur) => {
              const isSelected = dur.id === selectedDurationId
              return (
                <button
                  key={dur.id}
                  onClick={() => onDurationChange(dur.id)}
                  className={`flex h-[30px] items-center justify-center rounded-full border text-[14px] font-medium whitespace-nowrap transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary text-static-white'
                      : 'border-stroke-soft bg-bg-white text-text-strong'
                  }`}
                >
                  {dur.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Bottom buttons (84px = 16 + 52 + 16) */}
        <div className="flex gap-2 px-4 pt-4 pb-4">
          <button
            onClick={onClose}
            className="rounded-8 bg-bg-soft text-text-strong flex h-[52px] flex-1 items-center justify-center text-[15px] font-semibold"
          >
            닫기
          </button>
          <button
            onClick={onConfirm}
            className="rounded-8 bg-primary text-static-white flex h-[52px] flex-1 items-center justify-center text-[15px] font-semibold"
          >
            선택 완료
          </button>
        </div>
      </div>
    </>
  )
}
