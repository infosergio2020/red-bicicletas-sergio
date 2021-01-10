var Bicicleta = require('../../models/bicicleta');

exports.bicicleta_list = function (req, res) {
    // res.status(200).json({
    //     bicicletas: Bicicleta.allBicis
    // });
    Bicicleta.find({}, function(err, bicicletas){
        res.status(200).json({
            bicicletas : bicicletas
        });
    });
}

exports.bicicleta_create = function(req, res){
    // var bici = new Bicicleta(req.body.id, req.body.color, req.body.modelo);
    // bici.ubicacion = [req.body.lat, req.body.lng];
    // Bicicleta.add(bici);
    // res.status(200).json({
    //    bicicleta: bici
    // });
    var bicicleta = new Bicicleta({
        code:req.body.code,
        color:req.body.color,
        modelo:req.body.modelo
    });
    bicicleta.ubicacion = [req.body.lat, req.body.lng];

    bicicleta.save(function( err) {
        if( err ) console.log(err);
        res.status(200).json(bicicleta);
    });
}

exports.bicicleta_update = function (req, res) {
    // var bici = Bicicleta.findById(req.body.id);
    // bici.color = req.body.color;
    // bici.modelo = req.body.modelo;
    // bici.ubicacion = [req.body.lat, req.body.lng];
    // res.status(200).json({
    //    bicicleta: bici
    // });
    Bicicleta.findByCode(req.body.code, ( err, aBici ) => {
        if (err) console.log(err);
        if (aBici) {

            aBici.color = req.body.color;
            aBici.modelo = req.body.modelo
            aBici.ubicacion = [req.body.lat, req.body.lng];

            Bicicleta.updateOne(aBici, ( err, result ) => {
                if (err) console.log(err);
                res.status(200).json(result);
            });

        } else {
            res.status(204).json(aBici);
        }

    });
}

exports.bicicleta_delete = function (req, res) {
    // Bicicleta.removeById(req.body.id);
    // res.status(204).send();
    Bicicleta.removeByCode(req.body.code, function (error, resultado) {
        res.status(204).send();
    })

}
