define(['jquery',
  'js/widgets/citations/widget',
  'js/bugutils/minimal_pubsub',
  'js/components/api_query',
  './test_json/test1',
  './test_json/test2',
], function($, CitationWidget, MinPubSub, ApiQuery, Test1, Test2){

  describe("Citation Widget (UI Widget)", function(){

    var widget, minsub, sentRequest, numRequests;

    beforeEach(function(){
      numRequests = 0;
      widget = new CitationWidget();

      minsub = new (MinPubSub.extend({
        request: function(apiRequest) {
          sentRequest = apiRequest;
          numRequests++;

          if (sentRequest.toJSON().query.get("q")[0] === "citation:sampleBib1") {
            return Test1;
          } else if(sentRequest.toJSON().query.get("q")[0] === "citation:sampleBib2") {
            return Test2;
          }
        }
      }))({verbose: false});

      widget.activate(minsub.beehive.getHardenedInstance());
      var $w = widget.render().$el;

    });



    it("has a loadBibcodeInfo function that takes a bibcode, requests citation:data, and returns a promise", function(){

      var p = widget.loadBibcodeData("sampleBib1")

      //how do you get the apiQuery from the apiRequest in an easier way?
      expect(sentRequest.toJSON().query.get("q")[0]).to.equal("citation:sampleBib1")
      //test if it returns a promise
       expect(p.then).to.be.a("function")

    })

    it("fetches citation information for the bibcode only if it doesn't already have it and loads it into a collection", function(){

     widget.loadBibcodeData("sampleBib1");
      expect(numRequests).to.equal(1);


      expect(widget.collection.toJSON()[0].bibcode).to.equal("2013arXiv1305.3460H");

      widget.loadBibcodeData("sampleBib1");
      expect(numRequests).to.equal(1);

      widget.loadBibcodeData("sampleBib2");
      expect(numRequests).to.equal(2);

      expect(widget.collection.toJSON()[0].bibcode).to.equal('2006IEDL...27..896K');

    })

    it("resolves the promise from loadBibcodeInfo with the collection", function(){

     var promisedCollection;

     p = widget.loadBibcodeData("sampleBib1")

     p.done(function(collection){promisedCollection =  collection.toJSON()});

      expect(promisedCollection[0].identifier).to.equal(Test1.response.docs[0].identifier[0])
    })


  })


})