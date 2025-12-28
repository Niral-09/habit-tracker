import React, { useState, useEffect } from 'react';
import { Check, Flame, TrendingUp, Calendar, Award, ChevronLeft, ChevronRight } from 'lucide-react';

const HabitTracker = () => {
  const defaultHabits = [
    'Wake up 7 AM',
    'Make Bed',
    'Sunscreen',
    'Gym',
    'Walk 30 min',
    'Journal',
    'Meditate'
  ];

  const [habits, setHabits] = useState(defaultHabits);
  const [checkedDays, setCheckedDays] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const monthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  useEffect(() => {
    const saved = localStorage.getItem('habitTrackerData');
    if (saved) {
      const data = JSON.parse(saved);
      setCheckedDays(data.checkedDays || {});
      setHabits(data.habits || defaultHabits);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('habitTrackerData', JSON.stringify({ checkedDays, habits }));
  }, [checkedDays, habits]);

  const toggleDay = (habitIndex, day) => {
    const key = `${monthKey}-${habitIndex}-${day}`;
    setCheckedDays(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getProgress = (habitIndex, month = monthKey) => {
    const targetDate = month === monthKey ? currentDate : new Date(month.split('-')[0], month.split('-')[1], 1);
    const days = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate();
    let count = 0;
    for (let day = 1; day <= days; day++) {
      if (checkedDays[`${month}-${habitIndex}-${day}`]) count++;
    }
    return Math.round((count / days) * 100);
  };

  const getCurrentStreak = (habitIndex) => {
    let streak = 0;
    for (let day = daysInMonth; day >= 1; day--) {
      if (checkedDays[`${monthKey}-${habitIndex}-${day}`]) {
        streak++;
      } else if (streak > 0) {
        break;
      }
    }
    return streak;
  };

  const getDailyCompletion = (day) => {
    let count = 0;
    habits.forEach((_, index) => {
      if (checkedDays[`${monthKey}-${index}-${day}`]) count++;
    });
    return Math.round((count / habits.length) * 100);
  };

  const getMotivation = () => {
    const maxStreak = Math.max(...habits.map((_, i) => getCurrentStreak(i)));
    if (maxStreak >= 20) return "🔥 INSANE DISCIPLINE!";
    if (maxStreak >= 10) return "💪 KEEP GOING!";
    if (maxStreak >= 5) return "🌱 BUILDING MOMENTUM";
    return "🚀 START SMALL, STAY CONSISTENT";
  };

  const getMonthlyAverage = (month = monthKey) => {
    const total = habits.reduce((sum, _, i) => sum + getProgress(i, month), 0);
    return Math.round(total / habits.length);
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getAllMonths = () => {
    const months = new Set();
    Object.keys(checkedDays).forEach(key => {
      const [year, month] = key.split('-');
      if (year && month && !isNaN(year) && !isNaN(month)) {
        months.add(`${year}-${month}`);
      }
    });
    return Array.from(months).sort().reverse();
  };

  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-');
    return new Date(year, month, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get all years from data
  const getAllYears = () => {
    const years = [...new Set(getAllMonths().map(m => m.split('-')[0]))].sort().reverse();
    return years.length > 0 ? years : [new Date().getFullYear().toString()];
  };

  // Get months for selected year
  const getMonthsInYear = (year) => {
    return getAllMonths().filter(m => m.split('-')[0] === year);
  };

  // Generate year data for chart
  const getYearData = (year) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsInYear = getMonthsInYear(year);

    return monthNames.map((name, index) => {
      const monthKey = `${year}-${index}`;
      const hasData = monthsInYear.includes(monthKey);
      return {
        month: name,
        value: hasData ? getMonthlyAverage(monthKey) : 0,
        hasData
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Habit Tracker</h1>
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
                <p className="text-slate-500 font-medium min-w-[200px] text-center">{monthYear}</p>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} className="text-slate-600" />
                </button>
                <button
                  onClick={goToToday}
                  className="ml-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  Today
                </button>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-emerald-500">{getMonthlyAverage()}%</div>
              <div className="text-sm text-slate-500">Monthly Average</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-slate-200">
            {['daily', 'summary', 'streaks', 'charts', 'compare'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab === 'compare' ? 'Monthly Compare' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Tracker Tab */}
        {activeTab === 'daily' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <div className="min-w-max">
              <div className="grid gap-3">
                {/* Header Row */}
                <div className="flex gap-2">
                  <div className="w-40 font-semibold text-slate-700 flex items-center">Habit</div>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <div key={i} className="w-10 h-10 flex items-center justify-center text-xs font-medium text-slate-600">
                      {i + 1}
                    </div>
                  ))}
                  <div className="w-24 font-semibold text-slate-700 text-center">Progress</div>
                  <div className="w-20 font-semibold text-slate-700 text-center flex items-center justify-center gap-1">
                    <Flame size={16} className="text-orange-500" />
                    Streak
                  </div>
                </div>

                {/* Habit Rows */}
                {habits.map((habit, habitIndex) => {
                  const progress = getProgress(habitIndex);
                  const streak = getCurrentStreak(habitIndex);
                  return (
                    <div key={habitIndex} className="flex gap-2 items-center">
                      <div className="w-40 text-sm font-medium text-slate-700">{habit}</div>
                      {[...Array(daysInMonth)].map((_, day) => {
                        const isChecked = checkedDays[`${monthKey}-${habitIndex}-${day + 1}`];
                        return (
                          <button
                            key={day}
                            onClick={() => toggleDay(habitIndex, day + 1)}
                            className={`w-10 h-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 shadow-md'
                                : 'bg-white border-slate-300 hover:border-emerald-400'
                            }`}
                          >
                            {isChecked && <Check size={20} className="text-white" />}
                          </button>
                        );
                      })}
                      <div className="w-24 h-10 flex items-center justify-center">
                        <div className="w-full h-8 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          >
                            {progress > 15 && `${progress}%`}
                          </div>
                        </div>
                      </div>
                      <div className="w-20 h-10 flex items-center justify-center">
                        <span className={`text-lg font-bold ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {streak}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Daily Score Row */}
                <div className="flex gap-2 items-center mt-4 pt-4 border-t-2 border-slate-200">
                  <div className="w-40 text-sm font-bold text-slate-700">Daily Score</div>
                  {[...Array(daysInMonth)].map((_, day) => {
                    const completion = getDailyCompletion(day + 1);
                    return (
                      <div
                        key={day}
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{
                          backgroundColor: completion >= 75 ? '#22C55E' : completion >= 50 ? '#FCD34D' : completion > 0 ? '#FCA5A5' : '#E5E7EB',
                          color: completion > 0 ? '#ffffff' : '#9CA3AF'
                        }}
                      >
                        {completion}%
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Summary Tab */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Monthly Summary - {monthYear}</h2>
            <div className="grid gap-4">
              {habits.map((habit, index) => {
                const progress = getProgress(index);
                const daysCompleted = Math.round((progress / 100) * daysInMonth);
                return (
                  <div key={index} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-slate-800">{habit}</h3>
                      <div className="flex gap-4 text-sm">
                        <span className="text-slate-600">
                          <strong>{daysCompleted}</strong> / {daysInMonth} days
                        </span>
                        <span className="font-bold text-emerald-600">{progress}%</span>
                      </div>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Streaks & Motivation Tab */}
        {activeTab === 'streaks' && (
          <div className="grid gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Flame className="text-orange-500" />
                Current Streaks - {monthYear}
              </h2>
              <div className="grid gap-4">
                {habits.map((habit, index) => {
                  const streak = getCurrentStreak(index);
                  return (
                    <div key={index} className="flex justify-between items-center bg-slate-50 rounded-xl p-4">
                      <span className="font-medium text-slate-700">{habit}</span>
                      <div className="flex items-center gap-2">
                        <Flame size={20} className={streak > 0 ? 'text-orange-500' : 'text-slate-300'} />
                        <span className={`text-2xl font-bold ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`}>
                          {streak} days
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white text-center">
              <Award size={48} className="mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{getMotivation()}</h3>
              <p className="text-emerald-100">Keep building those healthy habits!</p>
            </div>
          </div>
        )}

        {/* Charts Tab */}
        {activeTab === 'charts' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp />
              Consistency Dashboard - {monthYear}
            </h2>

            <div className="grid gap-6">
              {/* Habit Comparison Chart */}
              <div>
                <h3 className="text-lg font-semibold text-slate-700 mb-4">Habit Completion Rates</h3>
                <div className="space-y-3">
                  {habits.map((habit, index) => {
                    const progress = getProgress(index);
                    return (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">{habit}</span>
                          <span className="font-semibold text-slate-800">{progress}%</span>
                        </div>
                        <div className="w-full h-6 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-emerald-600">{getMonthlyAverage()}%</div>
                  <div className="text-sm text-slate-600 mt-1">Avg Completion</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.max(...habits.map((_, i) => getCurrentStreak(i)))}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Best Streak</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {habits.filter((_, i) => getProgress(i) >= 80).length}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Habits 80%+</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {daysInMonth}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">Days This Month</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Compare Tab */}
        {activeTab === 'compare' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Calendar />
              Monthly Comparison
            </h2>

            {getAllMonths().length > 0 ? (
              <div className="space-y-8">
                {/* Year Selector */}
                <div>
                  {getAllYears().length > 1 && (
                    <div className="flex gap-2 mb-6">
                      <span className="text-slate-600 font-medium">Select Year:</span>
                      {getAllYears().map(year => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            selectedYear === year
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Bar Chart */}
                  <div className="bg-slate-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-slate-700 mb-6">
                      Monthly Consistency - {selectedYear}
                    </h3>

                    <div className="flex items-end justify-between gap-2 h-80">
                      {getYearData(selectedYear).map((data, index) => {
                        const maxValue = Math.max(...getYearData(selectedYear).map(d => d.value), 100);
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full flex flex-col justify-end items-center" style={{ height: '280px' }}>
                              {data.hasData && (
                                <div className="text-xs font-bold text-slate-700 mb-1">
                                  {data.value}%
                                </div>
                              )}
                              <div
                                className={`w-full rounded-t-lg transition-all duration-500 ${
                                  data.hasData
                                    ? data.value >= 75
                                      ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                                      : data.value >= 50
                                      ? 'bg-gradient-to-t from-yellow-500 to-yellow-400'
                                      : 'bg-gradient-to-t from-orange-500 to-orange-400'
                                    : 'bg-slate-200'
                                }`}
                                style={{
                                  height: data.hasData ? `${(data.value / maxValue) * 100}%` : '10px',
                                  minHeight: data.hasData ? '20px' : '10px'
                                }}
                              />
                            </div>
                            <div className="text-xs font-medium text-slate-600">
                              {data.month}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {(() => {
                      const yearData = getYearData(selectedYear);
                      const dataWithValues = yearData.filter(d => d.hasData);
                      const best = dataWithValues.reduce((max, d) => d.value > max.value ? d : max, { month: '-', value: 0 });
                      const worst = dataWithValues.reduce((min, d) => d.value < min.value ? d : min, { month: '-', value: 100 });
                      const avg = dataWithValues.length > 0
                        ? Math.round(dataWithValues.reduce((sum, d) => sum + d.value, 0) / dataWithValues.length)
                        : 0;

                      return (
                        <>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
                            <h4 className="font-semibold text-emerald-800 mb-2">🏆 Best Month</h4>
                            <div className="text-2xl font-bold text-emerald-600">{best.month}</div>
                            <div className="text-sm text-emerald-700 mt-1">{best.value}% completion</div>
                          </div>

                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                            <h4 className="font-semibold text-blue-800 mb-2">📊 Average</h4>
                            <div className="text-2xl font-bold text-blue-600">{avg}%</div>
                            <div className="text-sm text-blue-700 mt-1">Across {dataWithValues.length} months</div>
                          </div>

                          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
                            <h4 className="font-semibold text-orange-800 mb-2">💪 Growth Area</h4>
                            <div className="text-2xl font-bold text-orange-600">{worst.month}</div>
                            <div className="text-sm text-orange-700 mt-1">{worst.value}% completion</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Habit-by-Habit for Selected Year */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-700 mb-4">
                      Habit Progress in {selectedYear}
                    </h3>
                    {habits.map((habit, habitIndex) => {
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const dataWithValues = getYearData(selectedYear).filter(d => d.hasData);

                      return (
                        <div key={habitIndex} className="mb-6 bg-slate-50 rounded-xl p-4">
                          <h4 className="font-medium text-slate-700 mb-3">{habit}</h4>
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                            {dataWithValues.map((data) => {
                              const monthKey = `${selectedYear}-${monthNames.indexOf(data.month)}`;
                              const progress = getProgress(habitIndex, monthKey);
                              return (
                                <div key={data.month} className="text-center">
                                  <div className="text-xs text-slate-600 mb-1">{data.month}</div>
                                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                  <div className="text-xs font-semibold text-slate-700 mt-1">{progress}%</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                <p>Track habits for multiple months to see comparisons here!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;

// Add this at the end of app.js
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<HabitTracker />);
