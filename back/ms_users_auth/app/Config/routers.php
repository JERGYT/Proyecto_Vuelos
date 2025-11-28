<?php
use Slim\App;
use App\Controllers\UsersController;

return function (App $app) {
    
    $app->post('/login', [UsersController::class, 'login']);

    $app->get('/users', [UsersController::class, 'index']);       // Consultar todos
    $app->get('/users/{id}', [UsersController::class, 'show']);   // Consultar uno
    $app->post('/users', [UsersController::class, 'store']);      // Crear
    $app->put('/users/{id}', [UsersController::class, 'update']); // Modificar
    $app->delete('/users/{id}', [UsersController::class, 'delete']); // Eliminar


};