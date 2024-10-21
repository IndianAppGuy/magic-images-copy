export type Message =
  | { success: string }
  | { error: string }
  | { message: string };

export function FormMessage({ message }: { message: Message }) {
  return (
      <div className="flex flex-col gap-2 w-full max-w-md text-sm">
        {"success" in message && (
          <div className="text-black border-black border-l-2 border-foreground px-4">
            {message.success}
          </div>
        )}
        {"error" in message && (
          <div className="text-black border-l-2 border-black  px-4">
            {message.error}
          </div>
        )}
        {"message" in message && (
          <div className="text-black border-black text-foreground border-l-2 px-4">{message.message}</div>
        )}
      </div>

  );
}
