import Spinner from "./ui/Spinner/Spinner";

export default function Loading () {
    return (
        <div className="h-main-content flex flex-col justify-center items-center">
            <Spinner />
            <p className="mt-3">Loading...</p>
        </div>
    )
}