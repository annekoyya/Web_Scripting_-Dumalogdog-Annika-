<?php
// auth.php - Common authentication functions and JSON handling

function getUsers() {
    $file = 'users.json';
    if (!file_exists($file)) {
        return [];
    }
    $json = file_get_contents($file);
    return json_decode($json, true) ?? [];
}

function saveUsers($users) {
    $file = 'users.json';
    file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
}

function findUserByUsername($username) {
    $users = getUsers();
    foreach ($users as $user) {
        if ($user['username'] === $username) {
            return $user;
        }
    }
    return null;
}

// Initialize session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
