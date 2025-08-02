const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const app = express();
const PORT = 3000;

// Middleware
app.use(expressLayouts);
app.set('layout', 'layout'); // default layout
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'ekycSecret',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => res.redirect('/register'));

app.get('/register', (req, res) => res.render('register'));

app.post('/register', (req, res) => {
  const { fullname, nric, dob, email, phone } = req.body;
  if (!fullname || !nric || !dob || !email || !phone) {
    return res.send("Missing required fields");
  }
  res.redirect('/upload');
});

app.get('/upload', (req, res) => res.render('upload'));

app.post('/upload', (req, res) => {
    // Simulate OCR and AI-based document analysis
    req.session.documentVerified = true;
    res.redirect('/verify');
});

app.get('/verify', (req, res) => {
    setTimeout(() => {
        res.redirect('/face');
    }, 4000); // simulate 4s AI document checking
});

app.get('/face', (req, res) => res.render('face'));

app.post('/face', (req, res) => {
    const faceMatched = req.body.faceMatch === 'true';
    req.session.faceMatched = faceMatched;
    res.redirect('/otp');
});

app.get('/otp', (req, res) => res.render('otp'));

app.post('/otp', (req, res) => {
    const { otp } = req.body;
    if (otp === '123456') {
        req.session.authenticated = true;
    } else {
        req.session.authenticated = false;
    }
    res.redirect('/decision');
});

app.get('/myinfo', (req, res) => {
  res.json({
    fullname: "Tan Ah Kow",
    nric: "S1234567A",
    dob: "1950-05-01",
    email: "ahkow@example.com",
    phone: "91234567"
  });
});


app.get('/decision', (req, res) => {
    const { documentVerified, faceMatched, authenticated } = req.session;
    if (documentVerified && faceMatched && authenticated) {
        res.render('decision', { status: 'approved' });
    } else {
        let reason = '';
        if (!documentVerified) reason = 'document blurry';
        else if (!faceMatched) reason = 'face mismatch';
        else reason = 'otp failed';
        res.render('decision', { status: 'rejected', reason });
    }
});

app.listen(PORT, () => console.log(`eKYC app running on http://localhost:${PORT}`));
