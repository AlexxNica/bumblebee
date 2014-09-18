define(["marionette", "hbs!./templates/landing-page-layout",
    "js/widgets/base/base_widget"
  ],
  function (Marionette, fullLengthLayout, BaseWidget) {

    var history;

    var API = {

      insertTemplate: function () {
        $("#body-template-container").empty()
          .append(fullLengthLayout())

      },

      displayLandingPage: function () {
        this.insertTemplate();

        $(".search-bar-rows-container").append(this.widgetDict.searchBar.render().el);

      }

    };

    var LandingPageController = BaseWidget.extend({


      initialize: function (options) {

        options = options || {};

        this.widgetDict = options.widgetDict;
        _.extend(this, API);


        history = options.history;


      },

      activate: function (beehive) {



      },

      showPage: function (options) {

        if (!options.inDom){
          this.displayLandingPage()
        }

      }

    });


    return LandingPageController


  });