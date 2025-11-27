<?php
use Slim\App;
use App\Controllers\FlightsController;
use App\Middleware\AuthMiddleware;

return function (App $app) {
    
    $app->get('/', function ($req, $res) {
        $res->getBody()->write("API Vuelos Activa");
        return $res;
    });

    $app->group('/api', function ($group) {
        
        $group->get('/flights', [FlightsController::class, 'index']);
        $group->post('/flights', [FlightsController::class, 'store']);
        
    })->add(new AuthMiddleware());
};