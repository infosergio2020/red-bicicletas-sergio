var mongoose = require('mongoose');
var Bicicleta = require('../../models/bicicleta');
mongoose.connection.useDb('testdb');

describe('Testing Bicicletas', function(){

    beforeEach(function(done){
        console.log('Testeando...');
        done();
    });

    afterEach(function (done) {
        Bicicleta.deleteMany({}, function (err, success) {
            if (err) console.log(err);
            console.log('Base de datos borrada.');
            done();
        });
    });

    describe('Bicicleta.createInstance', () => {
       it('crea una instancia de Bicicleta', () => {
            var bici = Bicicleta.createInstance(1, "verde", "urbana", [-2,-7]);
            expect(bici.code).toBe(1);
            expect(bici.color).toBe("verde");
            expect(bici.modelo).toBe("urbana");
            expect(bici.ubicacion[0]).toEqual(-2);
            expect(bici.ubicacion[1]).toEqual(-7);
       });
    });

    describe('Bicicleta.allBicis', () => {
       it('comienza vacía', (done) => {
          Bicicleta.allBicis(function (err, bicis) {
              expect(bicis.length).toBe(0);
              done();
          });
       });
    });

    describe('Bicicleta.add', () => {
        it('agregamos solo una bici', (done) => {
            var aBici = new Bicicleta({code:1, color:"verde", modelo:"urbana"});
            Bicicleta.add(aBici, function (err, newBici) {
                if (err) console.log(err);
                Bicicleta.allBicis(function (err, bicis) {
                    expect(bicis.length).toBe(1);
                    expect(bicis[0].code).toBe(aBici.code);
                    done();
                });
            });
        });
    });

    describe('Bicicleta.findByCode', () => {
        it('debe devolver la bici con códe 1', (done) => {
            Bicicleta.allBicis(function (err, bicis) {
                expect(bicis.length).toBe(0);

                var aBici1 = new Bicicleta({code:1, color:"verde", modelo:"urbana"});
                Bicicleta.add(aBici1, function (err, newBici) {
                    if (err) console.log(err);
                    var aBici2 = new Bicicleta({code:2, color:"roja", modelo:"urbana"});
                    Bicicleta.add(aBici2, function (err, newBici) {
                        if (err) console.log(err);
                        Bicicleta.findByCode(1, function (error, targetBici) {
                            expect(targetBici.code).toBe(aBici1.code);
                            expect(targetBici.color).toBe(aBici1.color);
                            expect(targetBici.modelo).toBe(aBici1.modelo);
                            done();
                        })
                    });
                });

            });

        });
    });

    describe('Bicicleta.removeByCode', () => {
        it('debe devolver la bici con códe 1', (done) => {
            Bicicleta.allBicis(function (err, bicis) {
                expect(bicis.length).toBe(0);

                var aBici1 = new Bicicleta({code:1, color:"verde", modelo:"urbana"});
                Bicicleta.add(aBici1, function (err, newBici) {
                    if (err) console.log(err);
                    var aBici2 = new Bicicleta({code:2, color:"roja", modelo:"urbana"});
                    Bicicleta.add(aBici2, function (err, newBici) {
                        if (err) console.log(err);
                        Bicicleta.removeByCode(1, function (error, resultado) {
                            expect(resultado.n).toBe(1);
                            expect(resultado.ok).toBe(1);
                            expect(resultado.deletedCount).toBe(1);
                            done();
                        })
                    });
                });

            });

        });
    });

});

// beforeEach(() => {
//     Bicicleta.allBicis=[];
//     console.log('testeando...');
// })
//
// describe('Bicicleta.allBicis', () => {
//     it('comienza vacía', () => {
//        expect(Bicicleta.allBicis.length).toBe(0);
//     });
// })
//
// describe('Bicicleta.add', () => {
//     it('agregamos una', () => {
//         expect(Bicicleta.allBicis.length).toBe(0);
//         var a = new Bicicleta(1, 'rojo', 'urbana',[-2.897680710096602, -79.00608792901039]);
//         Bicicleta.add(a);
//         expect(Bicicleta.allBicis.length).toBe(1);
//         expect(Bicicleta.allBicis[0]).toBe(a);
//     });
// })
//
// describe('Bicicleta.findById', () => {
//     it('debe devolver la bici con id=1', () => {
//         expect(Bicicleta.allBicis.length).toBe(0);
//         var aBici1 = new Bicicleta(1, "verde", "urbana");
//         var aBici2 = new Bicicleta(2, "amarilla", "urbana");
//         Bicicleta.add(aBici1);
//         Bicicleta.add(aBici2);
//         var targetBici = Bicicleta.findById(1);
//         expect(targetBici.id).toBe(1);
//         expect(targetBici.color).toBe(aBici1.color);
//         expect(targetBici.modelo).toBe(aBici1.modelo);
//     });
// })
//
// describe('Bicicleta.removeById', () => {
//     it('debe devolver la lista sin el elemento elminado', () => {
//         expect(Bicicleta.allBicis.length).toBe(0);
//         var aBici1 = new Bicicleta(1, "verde", "urbana");
//         var aBici2 = new Bicicleta(2, "amarilla", "urbana");
//         Bicicleta.add(aBici1);
//         Bicicleta.add(aBici2);
//         Bicicleta.removeById(1);
//         expect(Bicicleta.allBicis.length).toBe(1);
//         // expect(Bicicleta.findById(1).error).toBe('No existe una bicicleta con el id 1');
//     });
// })
