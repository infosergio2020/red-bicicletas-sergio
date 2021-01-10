var express = require('express');
var router = express.Router();
var usuarioController = require('../../controllers/api/usuarioControllerAPI');

router.get('/', usuarioController.usuario_list);
router.post('/create', usuarioController.usuario_create);
router.post('/reservar', usuarioController.usuario_reservar);
// router.post('/update', usuarioController.usuario_update);
// router.post('/delete', usuarioController.usuario_delete);

module.exports = router;