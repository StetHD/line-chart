module n3Charts {
  'use strict';

  interface ILineChartScope extends ng.IScope {
    data;
    datasets;
    options;
    styles;
  }

  export class LineChart implements ng.IDirective  {

    public scope = {
      data: '=',
      datasets: '=',
      options: '=',
      styles: '='
    };

    public restrict = 'E';
    public replace = true;
    public template = '<div></div>';

    link = (scope: ILineChartScope, element: JQuery, attributes: ng.IAttributes) => {
      var eventMgr = new Utils.EventManager();
      var factoryMgr = new Utils.FactoryManager();

      // Initialize global events
      eventMgr.init(Utils.EventManager.EVENTS);

      // Register all factories
      // Note: we can apply additional arguments to each factory
      factoryMgr.registerMany([
        ['container', Factory.Container, element[0]],
        ['x-axis', Factory.Axis, Factory.Axis.SIDE_X],
        ['y-axis', Factory.Axis, Factory.Axis.SIDE_Y],
        ['series-line', Factory.Series.Line],
        ['style', Factory.StyleSheet],
      ]);

      // Initialize all factories
      factoryMgr.all().forEach((f) => f.instance.init(f.key, eventMgr, factoryMgr));

      // Trigger the create event
      eventMgr.trigger('create');

      // Trigger the update event
      scope.$watch('options+data', () => {
        // Call the update event with a copy of the options
        // and datasets to avoid infinite digest loop
        var options = new Utils.Options(angular.copy(scope.options));
        var datasets = new Utils.Dataset(angular.copy(scope.datasets), options);
        eventMgr.trigger('update', datasets, options);
      }, true);

      // Trigger the destroy event
      scope.$on('$destroy', () => eventMgr.trigger('destroy'));
    };
  }
}
