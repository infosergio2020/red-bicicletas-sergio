var Bicicleta = require('../../models/bicicleta');
var request = require('request');
var mongoose = require('mongoose');
var server = require('../../bin/www');
mongoose.connection.useDb('testapidb');

describe('Bicicleta API', () => {

    afterEach(function(done){
        Bicicleta.deleteMany({}, function( err, success ){
            if (err) console.log(err);
            done();
        });
    });

    describe('GET BICICLETAS /', () => {
        // it('Status 200', () => {
        //    expect(Bicicleta.allBicis.length).toBe(0);
        //     var a = new Bicicleta({code:1, color:"negra", modelo:"urbana", ubicacion:[-2.897680710096602, -79.00608792901039]});
        //     Bicicleta.add(a);
        //
        //     request.get('http://localhost:5000/api/bicicletas', function (error, response, body) {
        //        expect(response.statusCode).toBe(200);
        //     });
        // });
        it('Status 200', (done) => {
            Bicicleta.allBicis(( err, bicis ) => {
                expect(bicis.length).toBe(0);
                var aBici = new Bicicleta({code:1, color:"negra", modelo:"urbana"});
                Bicicleta.add(aBici, ( err, newBici) => {
                    if (err) console.log(err);
                    request.get('http://localhost:5000/api/bicicletas', (error, response, body) => {
                        expect(response.statusCode).toBe(200);
                        done();
                    });
                });
            });
        });
    });

    describe('POST BICICLETAS /create', () => {
        it('STATUS 200', (done) => {
            // var headers = {'content-type': 'application/json'};
            // var aBici = '{"id": 10, "color":"rojo", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
            //
            // request.post({
            //     headers: headers,
            //     url:'http://localhost:5000/api/bicicletas/create',
            //     body: aBici
            // }, function (error, response, body) {
            //     expect(response.statusCode).toBe(200);
            //     expect(Bicicleta.findById(10).color).toBe("rojo");
            //     done();
            // });
            var headers = {'content-type' : 'application/json'};
            var aBici = '{"code":1, "color":"rojo", "modelo":"Urbano", "lat":-2.897, "lng": -79.006}';

            request.post({
                    headers : headers,
                    url : 'http://localhost:5000/api/bicicletas/create',
                    body : aBici
                },
                function(error, response, body) {
                    expect(response.statusCode).toBe(200);
                    Bicicleta.findByCode(1, ( err, bicicleta) => {
                        if ( err) console.log(err);
                        expect(bicicleta.code).toBe(1);
                        done();
                    });

                });

        });
    });

    describe('POST BICICLETAS /update', () => {
        it('STATUS 200', (done) => {
            // var headers = {'content-type': 'application/json'};
            // var aBici = '{"id": 10, "color":"rojo", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
            //
            // request.post({
            //     headers: headers,
            //     url:'http://localhost:5000/api/bicicletas/create',
            //     body: aBici
            // }, function (error, response, body) {
            //     expect(response.statusCode).toBe(200);
            //     expect(Bicicleta.findById(10).color).toBe("rojo");
            //     aBici = '{"id": 10, "color":"azul", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
            //     request.post({
            //         headers: headers,
            //         url:'http://localhost:5000/api/bicicletas/update',
            //         body: aBici
            //     }, function (error, response, body) {
            //         expect(response.statusCode).toBe(200);
            //         expect(Bicicleta.findById(10).color).toBe("azul");
            //         done();
            //     });
            // });

            Bicicleta.allBicis(( err, bicis ) => {
                expect(bicis.length).toBe(0);
                var aBici = new Bicicleta({code:10, color:"rojo", modelo:"urbana"});
                Bicicleta.add(aBici, ( err, newBici) => {
                    if (err) console.log(err);
                    var headers = {'content-type' : 'application/json'};
                    var updateBici = '{"code": 10, "color":"azul", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
                    request.post({
                        headers: headers,
                        url : 'http://localhost:5000/api/bicicletas/update',
                        body : updateBici
                    },function(error, response, body) {
                        expect(response.statusCode).toBe(200);
                        Bicicleta.findByCode(10, ( err, bicicleta2) => {
                            if ( err) console.log(err);
                            expect(bicicleta2.code).toBe(newBici.code);
                            expect(bicicleta2.color).toBe("azul");
                            done();
                        });
                    });

                });
            });

        });
    });

    describe('POST BICICLETAS /delete', () => {
        it('STATUS 200', (done) => {
            // var headers = {'content-type': 'application/json'};
            // var aBici = '{"id": 10, "color":"rojo", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
            //
            // request.post({
            //     headers: headers,
            //     url:'http://localhost:5000/api/bicicletas/create',
            //     body: aBici
            // }, function (error, response, body) {
            //     expect(response.statusCode).toBe(200);
            //     expect(Bicicleta.findById(10).color).toBe("rojo");
            //     aBici = '{"id": 10}';
            //     request.post({
            //         headers: headers,
            //         url:'http://localhost:5000/api/bicicletas/delete',
            //         body: aBici
            //     }, function (error, response, body) {
            //         expect(response.statusCode).toBe(204);
            //         done();
            //     });
            // });
            Bicicleta.allBicis(( err, bicis ) => {
                expect(bicis.length).toBe(0);
                var aBici = new Bicicleta({code:10, color:"rojo", modelo:"urbana"});
                Bicicleta.add(aBici, ( err, newBici) => {
                    if (err) console.log(err);
                    var headers = {'content-type' : 'application/json'};
                    var updateBici = '{"code": 10, "color":"azul", "modelo":"urbana", "lat":-2.897, "lng": -79.006}';
                    request.post({
                        headers: headers,
                        url : 'http://localhost:5000/api/bicicletas/delete',
                        body : updateBici
                    },function(error, response, body) {
                        expect(response.statusCode).toBe(204);
                        done();
                    });

                });
            });
        });
    });

})
