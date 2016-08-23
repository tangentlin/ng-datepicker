import angular from 'angular';
import moment from 'moment';

export const DatePickerCalendarBindings = {
    onDateSelected: '&',
    minDate: '<',
    maxDate: '<',
    selectedDate: '=?',
    selectedStart: '=?',
    selectedEnd: '=?',
    /**
     * The month of the calendar should be displayed, Jan = 1 (not Jan = 0)
     */
    displayMonth: '=?',
    displayYear: '=?'
};

export function DatePickerCalendarController($locale) {

    /**
     * Controller's dependencies
     * @type {string[]}
     */
    DatePickerCalendarController.$inject = ['$locale'];

    /**
     * The view model of each day cell displayed, see createDayViewModel for more details
     * @type {Array}
     */
    this.days = [];

    /**
     * An array holding 1 through 31, representing the day number of each day of a month
     * @type {Array}
     * @private
     */
    this._dayNumbers = [];

    this.months = [];
    this.daysOfWeek = [];
    this.firstDayOfWeek = 0;

    /**
     * The first day of the month of the month the calendar should be displaying,
     * it could be a different month from the selected date
     */
    this._minDate = null;
    this._maxDate = null;
    //let selectedStart, selectedEnd, selectedRangeSet;

    /**
     * Whether the
     * @type {boolean}
     */
    this.selectedRangeSet = false;

    /**
     * Check and see if the passed in value is a date value
     * @param val
     */
    this.isDateValue = (val) => {
        return this.hasValue(val);
    };

    this.hasValue = (val) => {
        return !(val === null || typeof (val) === 'undefined');
    };


    /**
     * Get the date (sans time) of the supplied date
     * @param date
     * @return the date object that represent just the date portion of the supplied value
     */
    this.getDate = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    this.createDayViewModel = (baseMonth, dayNumber, isCurrentMonth) => {
        let date = new Date(baseMonth.getFullYear(), baseMonth.getMonth(), dayNumber);

        let dateMoment = moment(date);

        let viewModel = {
            date: date,
            dateNum: date.getTime(),
            day: dayNumber,
            isCurrentMonth: isCurrentMonth,
            isToday: dateMoment.isSame(this.today),

            isSpanStart: (this.selectedRangeSet) ? dateMoment.isSame(this.selectedStart) : false,
            isSpanEnd: (this.selectedRangeSet) ? dateMoment.isSame(this.selectedEnd) : false,
            isInSpan: (this.selectedRangeSet) ? ( dateMoment.isSameOrAfter(this.selectedStart) && dateMoment.isSameOrBefore(this.selectedEnd) ) : false,

            isSelected: dateMoment.isSame(this.selectedDate),
            isSelectable: (
                (( this._minDate === null ) ? true : ( date >= this._minDate ))
                && (( this._maxDate === null ) ? true : (date <= this._maxDate ))
            )
        };

        return viewModel;

    };

    this.setYearAndMonth = () => {
        let now = new Date();

        this.today = this.getDate(now);

        let firstDayOfMonth = new Date(this.displayYear, this.displayMonth - 1, 1),
            lastDayOfMonth = new Date(this.displayYear, this.displayMonth, 0),
            lastDayOfPreviousMonth = new Date(this.displayYear, this.displayMonth - 1, 0),
            daysInMonth = lastDayOfMonth.getDate(),
            daysInLastMonth = lastDayOfPreviousMonth.getDate(),
            dayOfWeek = firstDayOfMonth.getDay(),
            leadingDays = (dayOfWeek - this.firstDayOfWeek + 7) % 7 || 7; // Ensure there are always leading days to give context

        let leadingDayNumbers = this._dayNumbers.slice(-leadingDays - (31 - daysInLastMonth), daysInLastMonth);
        let trailingDayNumbers = this._dayNumbers.slice(0, 6 * 7 - (leadingDays + daysInMonth));
        let currentMonthDayNumbers = this._dayNumbers.slice(0, daysInMonth);

        let lastMonth = new Date(this.displayYear, this.displayMonth - 2, 1);
        let nextMonth = new Date(this.displayYear, this.displayMonth, 1);
        let thisMonth = firstDayOfMonth;

        let leadingDayModels = leadingDayNumbers.map((currentDay) => {
            return this.createDayViewModel(lastMonth, currentDay, false);
        }, this);
        let currentMonthDayModels = currentMonthDayNumbers.map((currentDay) => {
            return this.createDayViewModel(thisMonth, currentDay, true);
        }, this);
        // Ensure a total of 6 rows to maintain height consistency
        let trailingDayModels = trailingDayNumbers.map((currentDay) => {
            return this.createDayViewModel(nextMonth, currentDay, false);
        }, this);

        this.days = leadingDayModels.concat(currentMonthDayModels).concat(trailingDayModels);
    };

    this.changeToMonth = (date) => {
        this.displayYear = date.getFullYear();
        this.displayMonth = date.getMonth() + 1;

        this.setYearAndMonth(date);
    };

    this.changeMonthBy = function (amount) {
        let date = new Date(this.displayYear, this.displayMonth + amount - 1, 1);

        this.changeToMonth(date);
    };

    this.pickDay = function (evt) {
        let target = angular.element(evt.target);

        if (target.attr('isSelectable') == 'true') {
            let date = new Date(parseInt(target.attr('dateNum')));

            this.selectedDate = date;

            if (target.attr('isPadding') == 'true') {
                this.changeToMonth(date);
                this.onDateSelected();

                return;
            }

            this.setYearAndMonth(date);
            this.onDateSelected();
        }
    };

    /**
     * Whether the component has the current display (not necessarily selected) month set
     * @returns {boolean}
     */
    this.hasDisplayMonthDefined = () => {
        return this.hasValue(this.displayYear) && this.hasValue(this.displayMonth);
    };

    this.$onInit = () => {

        if (typeof $locale.DATETIME_FORMATS.FIRSTDAYOFWEEK === 'number') {
            this.firstDayOfWeek = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7;
        }

        this._minDate = ( this.isDateValue(this.minDate) ) ? new Date(this.minDate) : null;
        this._maxDate = ( this.isDateValue(this.maxDate) ) ? new Date(this.maxDate) : null;
        this.selectedStart = ( this.isDateValue(this.selectedStart) ) ? new Date(this.selectedStart) : null;
        this.selectedEnd = ( this.isDateValue(this.selectedEnd) ) ? new Date(this.selectedEnd) : null;
        this.selectedRangeSet = (this.selectedStart !== null && this.selectedEnd !== null);

        if (this.hasValue(this.selectedDate)) {
            this.selectedDate = new Date(this.selectedDate);
        }

        for (let i = 1; i <= 31; i++) {
            this._dayNumbers.push(i);
        }

        for (let i = 0; i < 12; i++) {
            this.months.push({
                fullName: $locale.DATETIME_FORMATS.MONTH[i],
                shortName: $locale.DATETIME_FORMATS.SHORTMONTH[i]
            });
        }

        for (let i = 0; i < 7; i++) {
            let day = $locale.DATETIME_FORMATS.DAY[(i + this.firstDayOfWeek) % 7];

            this.daysOfWeek.push({
                fullName: day,
                firstLetter: day.substr(0, 1)
            });
        }

        if (!this.hasDisplayMonthDefined())
        {
            let today = new Date();
            this.displayMonth = today.getMonth() + 1;
            this.displayYear = today.getFullYear();
        }

        this.setYearAndMonth();
    };
}
