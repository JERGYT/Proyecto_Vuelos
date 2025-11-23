<?php
use Slim\App;
use App\Controllers\UsersController;

return function (App $app) {
    $app->post('/login', [UsersController::class, 'login']);

    $app->get('/', function ($req, $res) {
        $res->getBody()->write("API Usuarios Funcionando");
        return $res;
    });
};