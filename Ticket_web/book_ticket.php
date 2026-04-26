<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid data"]);
        exit;
    }

    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $department = $data['department'] ?? '';
    $qty = $data['qty'] ?? 0;
    $totalAmount = $data['totalAmount'] ?? 0;
    $user_id = $_SESSION['user_id'] ?? null;

    $stmt = $conn->prepare("INSERT INTO bookings (user_id, name, email, department, qty, totalAmount) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("issssd", $user_id, $name, $email, $department, $qty, $totalAmount);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Booking confirmed!", "booking_id" => $stmt->insert_id]);
    } else {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
    $stmt->close();
}
$conn->close();
?>
