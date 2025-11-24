<?php
use Slim\App;
use App\Controllers\FlightsController;

return function (App $app) {
    $app->get('/flights', [FlightsController::class, 'index']);
    $app->post('/flights', [FlightsController::class, 'store']); 
    
    $app->get('/', function ($req, $res) {
        $res->getBody()->write("API Vuelos Activa");
        return $res;
    });
};