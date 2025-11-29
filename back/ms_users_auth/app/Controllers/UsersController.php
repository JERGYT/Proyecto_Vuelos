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
    public function index(Request $request, Response $response) {
        $users = $this->repository->getAll();
        $response->getBody()->write(json_encode($users));
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function show(Request $request, Response $response, $args) {
        $id = $args['id'];
        $user = $this->repository->findById($id);

        if ($user) {
            $response->getBody()->write(json_encode($user));
            return $response->withHeader('Content-Type', 'application/json');
        }
        
        $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }

    public function store(Request $request, Response $response) {
        $data = json_decode($request->getBody()->getContents(), true);
        
        if (!isset($data['email']) || !isset($data['password'])) {
            $response->getBody()->write(json_encode(['error' => 'Faltan datos']));
            return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
        }

        $user = $this->repository->create($data);
        $response->getBody()->write(json_encode($user));
        return $response->withStatus(201)->withHeader('Content-Type', 'application/json');
    }

    public function update(Request $request, Response $response, $args) {
        $id = $args['id'];
        $data = json_decode($request->getBody()->getContents(), true);
        
        $user = $this->repository->update($id, $data);

        if ($user) {
            $response->getBody()->write(json_encode(['message' => 'Usuario actualizado correctamente']));
        } else {
            $response->getBody()->write(json_encode(['error' => 'Usuario no encontrado']));
            return $response->withStatus(404);
        }
        return $response->withHeader('Content-Type', 'application/json');
    }

    public function delete(Request $request, Response $response, $args) {
        $id = $args['id'];
        $deleted = $this->repository->delete($id);

        if ($deleted) {
            $response->getBody()->write(json_encode(['message' => 'Usuario eliminado']));
            return $response->withHeader('Content-Type', 'application/json');
        }

        $response->getBody()->write(json_encode(['error' => 'No se pudo eliminar']));
        return $response->withStatus(404)->withHeader('Content-Type', 'application/json');
    }
    
}