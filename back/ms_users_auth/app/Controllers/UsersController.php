<?php
namespace App\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use App\Repositories\UserRepository;

class UsersController {
    private $repository;

    public function __construct() {
        $this->repository = new UserRepository();
    }

    public function login(Request $request, Response $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->repository->findByEmail($email);

        if ($user && $user->password === $password) {
            $token = bin2hex(random_bytes(16));
            $this->repository->updateToken($user->id, $token);

            $payload = json_encode([
                'status' => 'success',
                'token' => $token,
                'role' => $user->role,
                'user' => $user->name
            ]);
            
            $response->getBody()->write($payload);
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'Datos incorrectos']));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
    }
}