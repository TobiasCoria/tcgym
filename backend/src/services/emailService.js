const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarConfirmacionTurno = async (usuario, turno) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: 'Turno confirmado — TCGym',
      html: `
        <div style="font-family: Inter, sans-serif; background: #0f1117; color: white; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0;">TCGYM</h1>
          </div>
          <h2 style="font-size: 20px; margin-bottom: 8px;">Turno confirmado ✓</h2>
          <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px;">Hola ${usuario.nombre}, tu turno fue reservado correctamente.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Detalles del turno</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${new Date(turno.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p style="margin: 4px 0 0 0; color: #f97316; font-size: 16px; font-weight: bold;">${turno.hora.slice(0,5)}hs</p>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">Si necesitás cancelar tu turno, ingresá a la app.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error enviando email de confirmación:', err);
  }
};

const enviarCancelacionTurno = async (usuario, turno) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: 'Turno cancelado — TCGym',
      html: `
        <div style="font-family: Inter, sans-serif; background: #0f1117; color: white; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0;">TCGYM</h1>
          </div>
          <h2 style="font-size: 20px; margin-bottom: 8px;">Turno cancelado</h2>
          <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px;">Hola ${usuario.nombre}, tu turno fue cancelado.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Turno cancelado</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${new Date(turno.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.4); font-size: 16px; font-weight: bold;">${turno.hora.slice(0,5)}hs</p>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">Podés reservar un nuevo turno cuando quieras.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error enviando email de cancelación:', err);
  }
};

const enviarRecordatorio = async (usuario, turno) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: 'Recordatorio de turno mañana — TCGym',
      html: `
        <div style="font-family: Inter, sans-serif; background: #0f1117; color: white; padding: 40px; border-radius: 16px; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0;">TCGYM</h1>
          </div>
          <h2 style="font-size: 20px; margin-bottom: 8px;">Recordatorio 📅</h2>
          <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px;">Hola ${usuario.nombre}, te recordamos que mañana tenés un turno reservado.</p>
          <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.4); font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tu turno</p>
            <p style="margin: 0; font-size: 18px; font-weight: bold;">${new Date(turno.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p style="margin: 4px 0 0 0; color: #f97316; font-size: 16px; font-weight: bold;">${turno.hora.slice(0,5)}hs</p>
          </div>
          <p style="color: rgba(255,255,255,0.3); font-size: 12px; text-align: center;">Si necesitás cancelar tu turno, ingresá a la app antes de las 21hs.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Error enviando recordatorio:', err);
  }
};

module.exports = { enviarConfirmacionTurno, enviarCancelacionTurno, enviarRecordatorio };