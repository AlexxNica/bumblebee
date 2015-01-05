/**
 * This widget is capable of displaying messages to the user, however it does not
 * listen on the PubSub. It is invoked/controlled by alerts_mediator. That is the
 * controller which decides what to do.
 */

define([
    'js/widgets/base/base_widget',
    'js/components/api_query',
    'hbs!./templates/alerts_template',
    'marionette',
    'js/components/api_feedback',
    'jquery',
    'jquery-ui',
    'js/components/alerts'

  ],
  function(
    BaseWidget,
    ApiQuery,
    WidgetTemplate,
    Marionette,
    ApiFeedback,
    $,
    $ui,
    Alerts
    ){


    var AlertsModel = Backbone.Model.extend({
      defaults : {
        type: 'info',
        msg: undefined,
        events: undefined,
        modal: false
      }
    });


    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    
    var AlertsView = Marionette.ItemView.extend({

      tagName : "span",
      className : "s-alerts",

      initialize: function () {
      },

      template: WidgetTemplate,

      events: {
        'click #alertBox button.close': 'close'
      },

      modelEvents: {
        "change": 'render'
      },

      close: function() {
        this.model.set('msg', null);
      },

      render: function() {
        if (this.$el) {
          this.$el.off('.customEvents' + this.mid);
        }

        // this seems to be necessary (at least when the actions happen too fast ... like in unittests)
        if (this.$el && this.$el.find('#alertBox.modal').length) {
          var self = this;
          var args = arguments;
          this.$el.find('#alertBox.modal').modal('hide').one('hidden.bs.modal', function() {
            Marionette.ItemView.prototype.render.apply(self, args);
          });
          return;
        }

        Marionette.ItemView.prototype.render.apply(this, arguments);
      },

      onRender: function() {
        var self = this;
        var events = this.model.get('events');

        // attach functions to events; copied from backbone
        // when 'event' is fired, it will call/resolve the
        // promise object with the name of the event
        if (events) {
          var bindings = {};
          _.each(events, function(evtValue, evt) {

            var match = evt.match(delegateEventSplitter);
            var eventName = match[1], selector = match[2];
            var key = evt;

            var method = function(ev) {
              if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
              }
              var promise = this.model.get('promise');
              var evts = this.model.get('events');
              if (evts[key])
                promise.resolve(evts[key]);
              promise.resolve(key);
              // unless it is modal, close it automatically
              if (!this.model.get('modal')) {
                this.model.set('msg', null);
              }
            };

            method = _.bind(method, self);
            eventName += '.customEvents' + this.mid;
            if (selector === '') {
              self.$el.on(eventName, method);
            } else {
              self.$el.on(eventName, selector, method);
            }
          });
        }

        if (this.model.get('modal')) {
          this.showModal();
        }
      },

      showModal: function() {
        this.$el.find('#alertBox').modal('show');
      },
      closeModal: function() {
        this.$el.find('#alertBox').modal('hide');
      }
    });


    var AlertsWidget = BaseWidget.extend({

      initialize : function(options){
        this.model = new AlertsModel();
        this.view = new AlertsView({model : this.model});
        BaseWidget.prototype.initialize.apply(this, arguments);
        this.listenTo(this.view, 'custom-event', _.bind(this.onCustomEvent, this));
      },

      activate: function (beehive) {
        //pass
      },

      closeModal: function() {
        this.view.closeModal();
      },

      alert: function(feedback) {
        var promise = $.Deferred();
        this.model.set({
          events: feedback.events,
          msg: feedback.msg,
          type: feedback.type,
          modal: feedback.modal,
          promise: promise
        });
        return promise.promise();
      },

      onCustomEvent: function(ev, evtName) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }

        var events = this.model.get('events');

      }

    });


    return AlertsWidget;
  });