import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bars4Icon } from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AppLayout = () => {
  const [navOpen, setNavOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary-dark fixed w-full max-h-16 shadow p-4 z-30">
        <div className="flex justify-between gap-4">
          <button className='text-white' onClick={() => setNavOpen(!navOpen)}>
            <Bars4Icon className='w-8 h-8 hover:scale-130 active:scale-90 transition-transform' />
          </button>
          <Link to="/" className='hover:scale-103 hover:cursor-pointer transition-all ease-out' title="Ir a inicio"><h1 className='text-white text-2xl'>Servicios Especializados de Videoconferencia</h1></Link>
        </div>
      </div>

      <nav className={`bg-primary-dark/70 transition-all overflow-hidden px-7 w-60 fixed h-screen mt-16 shadow py-4 z-30 ${navOpen ? 'translate-x-0 visible' : '-translate-x-full invisible'}`}>
        <div className="container mx-auto flex flex-col gap-4">
          <NavLink
            to="/planes/sala"
            className={({ isActive }) =>
              `p-1 rounded-md text-white transition-colors pl-3 ${
                isActive ? 'bg-primary-extradark' : 'hover:bg-primary-extradark'
              }`
            }
          >
            Planes
          </NavLink>

          <NavLink
            to="/salas"
            className={({ isActive }) =>
              `p-1 rounded-md text-white transition-colors pl-3 ${
                isActive ? 'bg-primary-extradark' : 'hover:bg-primary-extradark'
              }`
            }
          >
            Salas
          </NavLink>

          <NavLink
            to="/tarifas"
            className={({ isActive }) =>
              `p-1 rounded-md text-white transition-colors pl-3 ${
                isActive ? 'bg-primary-extradark' : 'hover:bg-primary-extradark'
              }`
            }
          >
            Cambio de tarifas
          </NavLink>

          <NavLink
            to="/catalogo"
            className={({ isActive }) =>
              `p-1 rounded-md text-white transition-colors pl-3 ${
                isActive ? 'bg-primary-extradark' : 'hover:bg-primary-extradark'
              }`
            }
          >
            Catálogo
          </NavLink>

          <NavLink
            to="/documentos"
            className={({ isActive }) =>
              `p-1 rounded-md text-white transition-colors pl-3 ${
                isActive ? 'bg-primary-extradark' : 'hover:bg-primary-extradark'
              }`
            }
          >
            Documentos
          </NavLink>
        </div>
      </nav>

      <main className='pt-14'>
        <Toaster position='bottom-right' />
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;