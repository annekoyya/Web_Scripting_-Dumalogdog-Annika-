<?php
// If accessed directly, redirect to the registration form
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: register.html");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $fullname = trim($_POST["fullname"]);
    $email = trim($_POST["email"]);
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);
    $confirm_password = trim($_POST["confirm_password"]);
    $gender = $_POST["gender"];
    $hobbies = isset($_POST["hobbies"]) ? implode(",", $_POST["hobbies"]) : "";
    $country = $_POST["country"];

    $errors = [];

    // Validation checks
    if (empty($fullname)) {
        $errors[] = "Full name is required.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Invalid email format.";
    }
    if (empty($username)) {
        $errors[] = "Username is required.";
    }
    if (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters.";
    }
    if ($password !== $confirm_password) {
        $errors[] = "Passwords do not match.";
    }
    if (empty($country)) {
        $errors[] = "Please select a country.";
    }

    // Check for duplicate username in users.json
    $file = "users.json";
    $users = [];
    if (file_exists($file)) {
        $json = file_get_contents($file);
        $users = json_decode($json, true) ?? [];
        foreach ($users as $user) {
            if ($user['username'] === $username) {
                $errors[] = "Username already taken.";
                break;
            }
        }
    }

    // If no errors → save data
    if (empty($errors)) {
        $userData = [
            'fullname' => $fullname,
            'email' => $email,
            'username' => $username,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'gender' => $gender,
            'hobbies' => $hobbies,
            'country' => $country
        ];
        $users[] = $userData;
        file_put_contents($file, json_encode($users, JSON_PRETTY_PRINT));
        echo "<h3 style='color:green;'>Registration successful! You can now <a href='login.html'>Login</a>.</h3>";
    } else {
        // Show errors
        echo "<h3 style='color:red;'>Errors:</h3><ul>";
        foreach ($errors as $error) {
            echo "<li>$error</li>";
        }
        echo "</ul><a href='register.html'>Go Back</a>";
    }
}
?>
