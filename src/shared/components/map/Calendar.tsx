'use client'

import { addMonths, format, isBefore, startOfMonth } from 'date-fns'
import { ko } from 'date-fns/locale'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface CalendarProps {
  selectedDate: Date | null
  onChange: (date: Date) => void
  filterDate?: (date: Date) => boolean
  minMonth?: Date
  maxMonth?: Date
}

export default function Calendar({ selectedDate, onChange, filterDate, minMonth, maxMonth }: CalendarProps) {
  const handleChange = (date: Date | null) => {
    if (!date) return
    onChange(date)
  }

  return (
    <div className="modu-calendar">
      <DatePicker
        locale={ko}
        selected={selectedDate}
        onChange={handleChange}
        filterDate={filterDate}
        inline
        fixedHeight
        disabledKeyboardNavigation
        renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => {
          const isPrevDisabled = minMonth ? !isBefore(startOfMonth(minMonth), startOfMonth(monthDate)) : false
          const isNextDisabled = maxMonth
            ? !isBefore(startOfMonth(monthDate), startOfMonth(addMonths(maxMonth, 1)))
            : false

          return (
            <div className="flex items-center justify-between px-6 py-2">
              <span className="text-[16px] leading-[22px] font-semibold tracking-[-1px] text-[#171717]">
                {format(monthDate, 'yyyy년 M월')}
              </span>
              <div className="flex items-center gap-7 opacity-80">
                <button onClick={decreaseMonth} disabled={isPrevDisabled} className="p-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`size-6 ${isPrevDisabled ? 'text-[#D1D1D1]' : 'text-[#171717]'}`}
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button onClick={increaseMonth} disabled={isNextDisabled} className="p-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className={`size-6 ${isNextDisabled ? 'text-[#D1D1D1]' : 'text-[#171717]'}`}
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
