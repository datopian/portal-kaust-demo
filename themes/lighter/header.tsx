import PortalDefaultLogo from "@/components/_shared/PortalDefaultLogo";
import { useTheme } from "@/components/theme/theme-provider";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function LighterThemeHeader() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const portalLogo = "/images/logos/MainLogo.svg";

  useEffect(() => {
    const handleRouteChange = () => {
      setMobileMenuOpen(false); // Close the menu
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router.events]);

  return (
    <header className="bg-white border-b border-gray-100">
      <nav
        className={`mx-auto py-4 flex custom-container items-center justify-between  ${theme.styles.containerWide}`}
        aria-label="Global"
      >
        <div className="flex items-center">
          <span className="sr-only">KAUST</span>
          <Link href="/" className="flex items-center gap-4">
            <Image src={portalLogo} alt="KAUST" height={28} width={94} style={{ objectFit: "contain" }} />
            <div className="hidden xl:block leading-tight">
              <div className="text-sm font-semibold text-gray-900">King Abdullah University of Science and Technology</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Research Data Portal</div>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex lg:gap-x-8 items-center">
          <Link
            href="/search"
            className={`text-sm font-medium ${
              router.pathname === "/search" ? "text-accent" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Datasets
          </Link>
          <Link
            href="/stories"
            className={`text-sm font-medium ${
              router.pathname === "/stories" ? "text-accent" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Reports
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>
      <Dialog
        as="div"
        className="lg:hidden"
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-10" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <span className="sr-only">KAUST</span>
            <Link href="/" className="-m-1.5 p-1.5 inline-block md:hidden">
              <Image
                src={portalLogo}
                width={94}
                height={28}
                alt="KAUST"
                style={{ objectFit: "contain" }}
              />
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-[var(--text-base)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6 flex flex-col">
                <Link href="/search" className="text-sm font-medium text-gray-500">
                  Datasets
                </Link>
                <Link href="/stories" className="text-sm font-medium text-gray-500">
                  Reports
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </header>
  );
}
