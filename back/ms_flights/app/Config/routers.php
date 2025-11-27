<?php
use Slim\App;
use App\Controllers\FlightsController;
use App\Middleware\AuthMiddleware;
use App\Controllers\ReservationsController;

return function (App $app) {
    
    $app->get('/', function ($req, $res) {
        $res->getBody()->write("API Vuelos Activa");
        return $res;
    });

    $app->group('/api', function ($group) {
        
        $group->get('/flights', [FlightsController::class, 'index']);
        $group->post('/flights', [FlightsController::class, 'store']);

        $group->get('/reservations', [ReservationsController::class, 'index']);
        $group->post('/reservations', [ReservationsController::class, 'store']);
        $group->put('/reservations/{id}/cancel', [ReservationsController::class, 'cancel']);
        
    })->add(new AuthMiddleware());
};