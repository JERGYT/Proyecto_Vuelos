<?php
use Slim\App;
use App\Controllers\UsersController;

return function (App $app) {
    
    $app->post('/login', [UsersController::class, 'login']);

    $app->get('/users', [UsersController::class, 'index']);      
    $app->get('/users/{id}', [UsersController::class, 'show']);  
    $app->post('/users', [UsersController::class, 'store']);
    $app->put('/users/{id}', [UsersController::class, 'update']); 
    $app->delete('/users/{id}', [UsersController::class, 'delete']);


};