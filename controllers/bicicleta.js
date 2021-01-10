var Bicicleta = require('../models/bicicleta');

exports.bicicleta_list = function (req, res) {
    Bicicleta.find({}, function(err, bicicletas){
        // res.status(200).json({bicis : bicicletas});
        console.log(bicicletas);
        res.render('bicicletas/index', {bicis: bicicletas});
    });

}

exports.bicicleta_create_get = function (req, res) {
    res.render('bicicletas/create');
}

exports.bicicleta_create_post = function (req, res) {
    // var bici = new Bicicleta(req.body.id, req.body.color, req.body.modelo);
    // bici.ubicacion = [req.body.lat, req.body.lng];
    // console.log(bici);
    // Bicicleta.add(bici);
    var bicicleta = new Bicicleta({
        code:req.body.code,
        color:req.body.color,
        modelo:req.body.modelo
    });
    bicicleta.ubicacion = [req.body.lat, req.body.lng];

    bicicleta.save(function( err) {
        if( err ) console.log(err);
        res.redirect('/bicicletas');
        // res.status(200).json(bicicleta);
    });
}

exports.bicicleta_update_get = function (req, res) {
    // var bici = Bicicleta.findById(req.params.id);
    Bicicleta.findById(req.params.id, ( err, aBici ) => {
        if (err) console.log(err);
        console.log(aBici);
        if (aBici) {
            res.render('bicicletas/update', {bici: aBici});
        } else {
            res.render('bicicletas/update', {bici: aBici});
            // res.status(204).json(aBici);
        }

    });
}

exports.bicicleta_update_post = function (req, res) {
    // var bici = Bicicleta.findById(req.params.id);
    // bici.id = req.body.id;
    // bici.color = req.body.color;
    // bici.modelo = req.body.modelo;
    // bici.ubicacion = [req.body.lat, req.body.lng];

    Bicicleta.findByCode(req.body.code, ( err, aBici ) => {
        if (err) console.log(err);
        if (aBici) {

            aBici.color = req.body.color;
            aBici.modelo = req.body.modelo
            aBici.ubicacion = [req.body.lat, req.body.lng];

            Bicicleta.updateOne(aBici, ( err, result ) => {
                if (err) console.log(err);
                res.redirect('/bicicletas');
                // res.status(200).json(result);
            });

        } else {
            res.redirect('/update');
            // res.status(204).json(aBici);
        }

    });
}

exports.bicicleta_delete_post = function (req, res) {
    // Bicicleta.removeById(req.body.id);
    Bicicleta.removeByCode(req.body.code, function (error, resultado) {
        // res.status(204).send();
        res.redirect('/bicicletas');
    })
}
