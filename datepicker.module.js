import angular from 'angular';
import {DatePickerCalendarBindings, DatePickerCalendarController} from './datepicker.calendar.controller';

export default angular.module('ui.datepicker', [])
    .component('datepickerCalendar', {
        template: require('./datepicker.calendar.html'),
        bindings: DatePickerCalendarBindings,
        controller: DatePickerCalendarController
    })
    .name;
