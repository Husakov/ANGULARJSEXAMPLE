module.exports = function (module) {
    module
        .filter('minutesToDayPeriods', function () {
            return function (value) {
                let minutes = value % 60,
                    hours = Math.floor(value / 60),
                    dd = 'am';
                if (hours >= 12) {
                    hours = hours - 12;
                    dd = 'pm';
                }
                if (hours === 0) {
                    hours = 12;
                }
                minutes = minutes < 10 ? '0' + minutes : minutes;
                hours = hours < 10 ? '0' + hours : hours;

                return `${hours}:${minutes} ${dd}`;
            };
        });
};
