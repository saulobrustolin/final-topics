import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg font-sans",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-black group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500",
          error: "group-[.toaster]:text-red-600 group-[.toaster]:border-red-200",
          success: "group-[.toaster]:text-green-600 group-[.toaster]:border-green-200",
        },
      }}
      {...props}
    />
  )
}
