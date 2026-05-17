import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useOS } from '../context/OSContext';
import './CalendarFlyout.css';

const ACCENT_COLORS = {
  rose: '#f43f5e',
  purple: '#a855f7',
  blue: '#3b82f6',
  teal: '#14b8a6',
  amber: '#f59e0b',
  emerald: '#10b981',
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const CalendarFlyout = ({ onClose }) => {
  const { theme, colorScheme } = useOS();
  const flyoutRef = useRef(null);

  // Active time & date in header
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calendar month/year navigation state
  const [viewDate, setViewDate] = useState(new Date());
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  // Selection state
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  // Click outside detection to automatically close flyout
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Bind click listener after a tick to prevent immediate trigger on launch click
    const timer = setTimeout(() => {
      window.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  // Calendar grid calculations (6 weeks = 42 cells)
  const days = [];
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevTotalDays = new Date(viewYear, viewMonth, 0).getDate();

  // Previous month padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevTotalDays - i,
      isCurrentMonth: false,
      date: new Date(viewYear, viewMonth - 1, prevTotalDays - i)
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(viewYear, viewMonth, i)
    });
  }

  // Next month padding
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(viewYear, viewMonth + 1, i)
    });
  }

  const navigateMonth = (direction) => {
    setViewDate(new Date(viewYear, viewMonth + direction, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date.getDate() === selectedDay &&
           date.getMonth() === viewMonth &&
           date.getFullYear() === viewYear;
  };

  const accentColor = ACCENT_COLORS[colorScheme] || '#a855f7';

  // Format header elements
  const formatTime = (d) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDateLong = (d) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString([], options);
  };

  const formatMonthYear = (year, monthIndex) => {
    const tempDate = new Date(year, monthIndex, 1);
    return tempDate.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  return (
    <div 
      className={`calendar-flyout-container glass-panel ${theme === 'dark' ? 'dark-theme' : 'body-theme-light'}`} 
      ref={flyoutRef}
      onClick={(e) => e.stopPropagation()} // Prevent propagation from closing immediately
      style={{
        background: theme === 'dark' ? 'rgba(25, 25, 35, 0.82)' : 'rgba(255, 255, 255, 0.75)',
      }}
    >
      {/* ===== Time/Date Header Section ===== */}
      <div className="calendar-header">
        <div className="calendar-header-time">{formatTime(now)}</div>
        <div 
          className="calendar-header-date"
          style={{
            color: accentColor,
          }}
        >
          {formatDateLong(now)}
        </div>
      </div>

      {/* ===== Navigation row ===== */}
      <div className="calendar-nav-row">
        <div className="calendar-month-year">
          {formatMonthYear(viewYear, viewMonth)}
        </div>
        <div className="calendar-nav-btns">
          <button className="calendar-nav-btn" onClick={() => navigateMonth(-1)}>
            <ChevronLeft size={16} />
          </button>
          <button className="calendar-nav-btn" onClick={() => navigateMonth(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ===== Calendar Grid ===== */}
      <div className="calendar-grid">
        {WEEKDAYS.map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {days.map((item, index) => {
          const today = isToday(item.date);
          const selected = isSelected(item.date);
          return (
            <div
              key={index}
              className={`calendar-day-cell ${!item.isCurrentMonth ? 'outside-month' : ''} ${today ? 'is-today' : ''} ${selected ? 'is-selected' : ''}`}
              onClick={() => {
                if (item.isCurrentMonth) {
                  setSelectedDay(item.day);
                } else {
                  setSelectedDay(item.day);
                  setViewDate(item.date);
                }
              }}
              style={{
                backgroundColor: today ? accentColor : 'transparent',
                boxShadow: today ? `0 4px 12px ${accentColor}40` : 'none',
              }}
            >
              {item.day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarFlyout;
