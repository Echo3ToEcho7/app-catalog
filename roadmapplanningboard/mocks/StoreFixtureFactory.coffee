Ext = window.Ext4 || window.Ext

Ext.define 'Rally.test.apps.roadmapplanningboard.mocks.StoreFixtureFactory',

    getRoadmapStoreFixture: ->
        return @roadmapStoreFixture if @roadmapStoreFixture

        @roadmapStoreFixture = Ext.create 'Ext.data.Store',
            model: Deft.Injector.resolve('appModelFactory').getRoadmapModel()
            proxy:
                type: 'memory'

            data: [
                {
                    "id": "413617ecef8623df1391fabc",
                    "name": "My Roadmap",
                    "ref": "http://localhost:8090/plan-service/api/plan/413617ecef8623df1391fabc",
                    "plans": [
                        {
                            "id": "513617ecef8623df1391fefc"
                        },
                        {
                            "id": "513617f7ef8623df1391fefd"
                        },
                        {
                            "id": "51361807ef8623df1391fefe"
                        }
                    ]
                },
                {
                    "id": "77",
                    "name": "test",
                    "ref": "test",
                    "plans": [
                        {
                            "id": "3"
                        },
                        {
                            "id": "rgreaesrgsrdbsrdghsrgsrese" #non-existent plan
                        }
                    ]
                }
            ]

        @roadmapStoreFixture.model.setProxy 'memory'
        @roadmapStoreFixture

    getPlanningStoreFixture: ->
        return @planningStoreFixture if @planningStoreFixture
        
        @planningStoreFixture = Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Deft.Injector.resolve('appModelFactory').getPlanningModel()
            proxy:
                type: 'memory'

            data: [
                {
                    "id": "513617ecef8623df1391fefc",
                    "ref": "http://localhost:8090/plan-service/api/plan/513617ecef8623df1391fefc",
                    "lowCapacity": 2,
                    "highCapacity": 8,
                    "name": "Release 1.1",
                    "theme": "Take over the world!",
                    "timeframe": {
                        "id": "2"
                    },
                    "features": [
                        {
                            "id": "51300181ef868cfedc980a37",
                            "ref": "http://localhost:8080/portfolio-service/feature/51300181ef868cfedc980a37"
                        },
                        {
                            "id": "51300182ef868cfedc980a38",
                            "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a38"
                        },
                        {
                            "id": "51300182ef868cfedc980a39",
                            "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a39"
                        }
                    ]
                },
                {
                    "id": "513617f7ef8623df1391fefd",
                    "ref": "http://localhost:8090/plan-service/api/plan/513617f7ef8623df1391fefd",
                    "lowCapacity": 3,
                    "highCapacity": 30,
                    "name": "Release 1.2",
                    "theme": "Win Foosball Championship",
                    "timeframe": {
                        "id": "3"
                    },
                    "features": [
                        {
                            "id": "51300182ef868cfedc980a3c",
                            "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3c"
                        }
                    ]
                },
                {
                    "id": "51361807ef8623df1391fefe",
                    "ref": "http://localhost:8090/plan-service/api/plan/51361807ef8623df1391fefe",
                    "lowCapacity": 15,
                    "highCapacity": 25,
                    "name": "Release 2.0",
                    "timeframe": {
                        "id": "4"
                    },
                    "features": []
                },
                {
                    "id": "3",
                    "ref": "http://localhost:8090/plan-service/api/plan/3",
                    "lowCapacity": 0,
                    "highCapacity": 0,
                    "name": " ",
                    "timeframe": {
                        "id": "7"
                    },
                    "features": []
                }
            ]

        @planningStoreFixture.model.setProxy 'memory'
        @planningStoreFixture

    getFeatureStoreFixture: ->
        @featureStoreFixture = Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Deft.Injector.resolve('appModelFactory').getFeatureModel()
            proxy:
                type: 'memory'

            data: [
                {
                    "id": "51300181ef868cfedc980a37",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300181ef868cfedc980a37",
                    "name": "Android Support",
                    "refinedEstimate": 4,
                    "subscriptionId": "1"
                },
                {
                    "id": "51300182ef868cfedc980a38",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a38",
                    "name": "iOS Support",
                    "refinedEstimate": 2,
                    "subscriptionId": "1"
                },
                {
                    "id": "51300182ef868cfedc980a39",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a39",
                    "name": "HTML 5 Webapp",
                    "refinedEstimate": 3,
                    "subscriptionId": "1"
                },
                {
                    "id": "51300182ef868cfedc980a3a",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3a",
                    "name": "Blackberry Native App",
                    "refinedEstimate": 1,
                    "subscriptionId": "1"
                },
                {
                    "id": "51300182ef868cfedc980a3b",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3b",
                    "name": "Windows Phone Support",
                    "refinedEstimate": 3,
                    "subscriptionId": "2"
                },
                {
                    "id": "51300182ef868cfedc980a3c",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3c",
                    "name": "Ubuntu Phone Application",
                    "refinedEstimate": 4,
                    "subscriptionId": "2"
                },
                {
                    "id": "51300182ef868cfedc980a3d",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3d",
                    "name": "Tester's Large Test Card 1",
                    "refinedEstimate": 13,
                    "subscriptionId": "2"
                },
                {
                    "id": "51300182ef868cfedc980a3e",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3e",
                    "name": "Tester's Large Test Card 2",
                    "refinedEstimate": 21,
                    "subscriptionId": "2"
                },
                {
                    "id": "51300182ef868cfedc980a3f",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a3f",
                    "name": "Tester's Large Test Card 3",
                    "refinedEstimate": 13,
                    "subscriptionId": "2"
                },
                {
                    "id": "51300182ef868cfedc980a40",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a40",
                    "name": "Tester's Large Test Card 4",
                    "refinedEstimate": 8,
                    "subscriptionId": "2"
                }
            ]

        @featureStoreFixture.model.setProxy 'memory'
        @featureStoreFixture

    getSecondFeatureStoreFixture: ->
        @secondFeatureStoreFixture = Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Deft.Injector.resolve('appModelFactory').getFeatureModel()
            proxy:
                type: 'memory'
            data: [
                {
                    "id": "51300181ef868cfedc980a80",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300181ef868cfedc980a80",
                    "name": "Battlestar Gallactica",
                    "refinedEstimate": 6,
                    "subscriptionId": "1"
                },
                {
                    "id": "51300182ef868cfedc980a81",
                    "ref": "http://localhost:8080/portfolio-service/feature/51300182ef868cfedc980a81",
                    "name": "Firefly",
                    "refinedEstimate": 3,
                    "subscriptionId": "1"
                }
            ]

        @secondFeatureStoreFixture.model.setProxy 'memory'
        @secondFeatureStoreFixture

    getTimeframeStoreFixture: ->
        @timeframeStoreFixture = Ext.create 'Ext.data.Store',
            extend: 'Ext.data.Store'
            model: Deft.Injector.resolve('appModelFactory').getTimeframeModel()
            proxy:
                type: 'memory'
            data: [
                {
                    id: '2',
                    name: 'Q1',
                    start: new Date('1/01/2013'),
                    end: new Date('3/31/2013')
                },
                {
                    id: '3',
                    name: 'Q2',
                    start: new Date('4/01/2013'),
                    end: new Date('6/30/2013')
                },
                {
                    id: '4',
                    name: 'Future Planning Period',
                    start: new Date('7/01/2013'),
                    end: new Date('6/30/2014')
                },
                {
                    id: '7',
                    name: '',
                    start: null,
                    end: null
                }
            ]

        @timeframeStoreFixture.model.setProxy 'memory'
        @timeframeStoreFixture
