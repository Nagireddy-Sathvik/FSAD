<?php
session_start();
require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $fullname = $_POST['fullname'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm-password'] ?? '';

    if ($password !== $confirm_password) {
        echo "<script>alert('Passwords do not match.'); window.history.back();</script>";
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $conn->prepare("INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $fullname, $email, $hashed_password);

    if ($stmt->execute()) {
        $_SESSION['user_id'] = $stmt->insert_id;
        $_SESSION['fullname'] = $fullname;
        $_SESSION['email'] = $email;
        echo "<script>alert('Sign up successful! Redirecting to home...'); window.location.href = 'index.html';</script>";
    } else {
        if ($conn->errno == 1062) { // Duplicate entry
            echo "<script>alert('Email already registered.'); window.history.back();</script>";
        } else {
            echo "<script>alert('Error occurred during registration.'); window.history.back();</script>";
        }
    }
    $stmt->close();
}
$conn->close();
?>
