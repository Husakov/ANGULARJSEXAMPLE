const L = require('leaflet');
const myIcon = L.divIcon({className: 'marker-icon'});
require('./leaflet-map.scss');

class Controller {
    constructor($element, $scope) {
        'ngInject';

        this.$element = $element;
        this.$scope = $scope;
        $scope.$on('update', () => this.update());
        this.initMap();
    }

    $onChanges({coordObjs}) {
        if (coordObjs && coordObjs.currentValue) {
            this.setCoords();
            this.calcCenter();
        }
    }

    setCoords() {
        this.markers.clearLayers();
        if (_.isArray(this.coordObjs)) {
            this.coords = this.coordObjs
        } else {
            this.coords = [this.coordObjs];
        }
        this.coords = _(this.coords)
            .map(o => _.has(o, 'latitude') && _.has(o, 'longitude') ? o : null)
            .compact()
            .map(o => [o.latitude, o.longitude])
            .value();

        this.coords.forEach(
            c => this.markers.addLayer(L.marker(c, {icon: myIcon}))
        );
    }

    calcCenter() {
        let center;
        if (this.coords.length === 1) {
            center = this.coords[0];
        } else {
            let min = [0, 0],
                max = [0, 0];
            this.coords.forEach(c => {
                min = [Math.min(c[0], min[0]), Math.min(c[1], min[1])];
                max = [Math.max(c[0], max[0]), Math.max(c[1], max[1])];
            });
            center = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2];
        }
        this.map.flyTo(center);
    }

    initMap() {
        this.map = L.map(this.$element[0], {
            scrollWheelZoom: false,
            dragging: false,
            center: [0, 0],
            zoom: this.zoom,
            zoomControl: false,
            attributionControl: false
        });
        L.tileLayer('https://cartocdn_{s}.global.ssl.fastly.net/base-flatblue/{z}/{x}/{y}.png', {})
            .addTo(this.map);

        this.markers = L.layerGroup();
        this.markers.addTo(this.map);
    }

    update() {
        this.map.invalidateSize();
    }
}

module.exports = angular.module('intercom.components.leafletMap', [])
    .component('leafletMap', {
        controller: Controller,
        bindings: {
            coordObjs: '<',
            zoom: '@'
        }

    });
