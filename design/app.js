// Front-end event wiring for the Elige Pilar screen
// - Las tarjetas están en <a class="card" data-type="...">. Conectar la navegación aquí.
// - Los botones de la barra inferior tienen data-action (home, graph).

document.addEventListener('DOMContentLoaded', function () {
  // Tarjetas principales
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const type = card.getAttribute('data-type');
      // TODO: Reemplazar console.log con navegación/llamado a router
      console.log('Pilar seleccionado:', type);

      /*
        Ejemplos de integración:
        - En Next.js: router.push(`/pilares/${type}`)
        - En React-router: navigate(`/pilares/${type}`)
        - En una app que usa endpoints: window.location.href = `/pilares/${type}`

        También puede abrir un modal o enviar evento al store global.
      */

      // EJEMPLO provisional: efecto visual y aria-live update
      card.classList.add('clicked');
      setTimeout(()=> card.classList.remove('clicked'), 200);
    });
  });

  // Barra inferior
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = btn.getAttribute('data-action');
      console.log('Nav action:', action);

      /*
        TODO: mapear actions a rutas reales
        - 'home' -> '/'
        - 'graph' -> '/analytics' o ruta del dashboard
      */
    });
  });

  // Mejora táctil: ampliar área de toque (ya están diseñadas así)
});
