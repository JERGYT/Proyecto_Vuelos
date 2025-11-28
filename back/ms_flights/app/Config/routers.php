<?php
use Slim\App;
use App\Controllers\FlightsController;
use App\Middleware\AuthMiddleware;
use App\Controllers\ReservationsController;
use App\Controllers\NavesController;

return function (App $app) {
    

    $app->group('/api', function ($group) {
        
        $group->get('/flights', [FlightsController::class, 'index']);
        $group->post('/flights', [FlightsController::class, 'store']);

        $group->get('/reservations', [ReservationsController::class, 'index']);
        $group->post('/reservations', [ReservationsController::class, 'store']);
        $group->put('/reservations/{id}/cancel', [ReservationsController::class, 'cancel']);

        $group->get('/naves', [NavesController::class, 'index']);
        $group->post('/naves', [NavesController::class, 'store']);
        $group->delete('/naves/{id}', [NavesController::class, 'delete']);
        
    })->add(new AuthMiddleware());
};