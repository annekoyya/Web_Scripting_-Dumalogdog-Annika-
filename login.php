<?php
require_once 'auth.php';

// If accessed directly, redirect to the login form
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    header("Location: login.html");
    exit;
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);
    $errors = [];

    if (empty($username)) {
        $errors[] = "Username is required.";
    }
    if (empty($password)) {
        $errors[] = "Password is required.";
    }

    if (empty($errors)) {
        $user = findUserByUsername($username);
        
        if ($user && password_verify($password, $user['password'])) {
            // Start session and store user data
            $_SESSION['username'] = $user['username'];
            $_SESSION['fullname'] = $user['fullname'];
            
            // Redirect to welcome or dashboard page
            echo "<h3 style='color:green;'>Login successful! Welcome, " . htmlspecialchars($user['fullname']) . "!</h3>";
            // You can add a redirect here to a welcome or dashboard page
            // header("Location: welcome.php");
            // exit;
        } else {
            echo "<h3 style='color:red;'>Invalid username or password.</h3>";
            echo "<p><a href='login.html'>Try Again</a></p>";
        }
    } else {
        echo "<h3 style='color:red;'>Errors:</h3><ul>";
        foreach ($errors as $error) {
            echo "<li>" . htmlspecialchars($error) . "</li>";
        }
        echo "</ul>";
        echo "<p><a href='login.html'>Go Back</a></p>";
    }
}
?>
