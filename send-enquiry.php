<?php
// Yoganand Electricals & Automation - enquiry form mailer
// Receives the contact page form and emails it to the address below.

// ---------- Settings ----------
// Where enquiries are delivered. Trial phase address: change this one line to go live.
const ENQUIRY_TO = 'curlykicksss@gmail.com';
// Sender shown on the email. Should be an address on the website's own domain,
// otherwise many hosts refuse to send or the email lands in spam.
const ENQUIRY_FROM = 'no-reply@yoganandelectricals.com';
const ENQUIRY_FROM_NAME = 'Yoganand Website';

const SERVICES = [
    'Maintenance contract / AMC',
    'Automation project',
    'Control panels',
    'Materials supply',
    'Technical manpower',
    'Other',
];

// ---------- Helpers ----------
// The page script asks for JSON; a plain form post (no JavaScript) gets a small page.
$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(int $status, bool $ok, string $message): void
{
    global $wantsJson;
    http_response_code($status);
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $safe = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        echo '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
            . '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            . '<title>Enquiry | Yoganand Electricals &amp; Automation</title></head>'
            . '<body style="font-family:sans-serif;max-width:560px;margin:60px auto;padding:0 16px">'
            . '<p>' . $safe . '</p><p><a href="contact.html">Back to the contact page</a></p></body></html>';
    }
    exit;
}

// Single-line field: trimmed, no line breaks (blocks email header injection), length-limited
function field(string $name, int $max): string
{
    $value = isset($_POST[$name]) && is_string($_POST[$name]) ? $_POST[$name] : '';
    $value = trim(preg_replace('/[\r\n\t]+/', ' ', $value));
    return mb_substr($value, 0, $max);
}

// ---------- Request checks ----------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'This page only accepts the enquiry form.');
}

// Hidden field that people never see or fill; bots usually do. Pretend it worked.
if (!empty($_POST['website'])) {
    respond(200, true, 'Thank you! Your enquiry has been sent.');
}

// ---------- Read and validate ----------
$name = field('name', 100);
$phone = field('phone', 20);
$company = field('company', 150);
$service = field('service', 60);
$message = isset($_POST['message']) && is_string($_POST['message']) ? trim($_POST['message']) : '';
$message = mb_substr(str_replace("\r\n", "\n", $message), 0, 3000);

if ($name === '' || !preg_match('/^[0-9+\-\s]{10,15}$/', $phone)) {
    respond(422, false, 'Please enter your name and a valid phone number.');
}
if (!in_array($service, SERVICES, true)) {
    $service = 'Other';
}

// ---------- Build and send the email ----------
$subject = 'Enquiry: ' . $service . ' - ' . $name;
$body = implode("\n", [
    'New enquiry from the website contact form',
    '',
    'Name: ' . $name,
    'Phone: ' . $phone,
    'Company / Plant: ' . ($company !== '' ? $company : '-'),
    'Interested in: ' . $service,
    '',
    'Message:',
    $message !== '' ? $message : '-',
    '',
    '--',
    'Sent: ' . date('d M Y, H:i') . ' (server time)',
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
]);

$headers = implode("\r\n", [
    'From: ' . ENQUIRY_FROM_NAME . ' <' . ENQUIRY_FROM . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . phpversion(),
]);

$sent = mail(
    ENQUIRY_TO,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    wordwrap($body, 70, "\n"),
    $headers,
    '-f' . ENQUIRY_FROM
);

if (!$sent) {
    respond(500, false, 'Sorry, your enquiry could not be sent. Please call us at 9850953797.');
}

respond(200, true, 'Thank you! Your enquiry has been sent. We will get back to you soon.');
