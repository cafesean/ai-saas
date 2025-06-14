const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'admin123';
  const hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  
  console.log('Testing password:', password);
  console.log('Against hash:', hash);
  
  try {
    const isValid = await bcrypt.compare(password, hash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      // Test with the actual password that might have been used
      const testPasswords = ['admin123', 'password', 'secret', 'admin'];
      for (const testPass of testPasswords) {
        const result = await bcrypt.compare(testPass, hash);
        console.log(`Testing "${testPass}":`, result);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPassword(); 