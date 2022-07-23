export function Icon(props: {
    svg: React.FC,
    onClick?: () => void;
    title?: string
    className?: string,
    style?: React.CSSProperties
}) { return <span title={props.title} className={props.className} style={props.style} onClick={props.onClick}><props.svg /></span>; }

const _PaperClipSvg = <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="paper-clip"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true">
    <path
        d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364 224.8 602.1A172.22 172.22 0 00174 724.8c0 46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z">
    </path>
</svg>;
export function PaperClipSvg() { return _PaperClipSvg; }

const _UploadSvg = <svg
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="upload"
    width="1em"
    height="1em"
    fill="currentColor"
    aria-hidden="true">
    <path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z"></path>
</svg>;
export function UploadSvg() { return _UploadSvg; }

const _DeleteSvg = <svg id="delete-item"
    viewBox="64 64 896 896"
    focusable="false"
    data-icon="delete"
    width="1em" height="1em"
    fill="currentColor"
    aria-hidden="true"
    transform="translate(0 -1.5)">
    <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
</svg>;
export function DeleteSvg() { return _DeleteSvg; }

const _LineArrowDownSvg = <svg
    viewBox="0 0 23 23"
    width="1.3em"
    height="1.3em"
    fill="currentColor">
    <rect x="0" y="6" width="70%" height="65%" fill="none"></rect>
    <path fill="currentColor" d="M5.6 12 l4.594 4.594 4.594-4.594 1.406 1.406-6 6-6-6z"></path>
</svg>;
export function LineArrowDownSvg() { return _LineArrowDownSvg; }

const _SolidArrowDownSvg = <svg
    width="1em"
    height="1em"
    viewBox="0 0 20 20"
    fill="currentColor">
    <path d="M7 10l5 5 5-5z"/>
</svg>;
export function SolidArrowDownSvg() { return _SolidArrowDownSvg; }

const _PlusSignSvg = <svg
    viewBox="0 0 22 22"
    width="1em"
    height="1em"
    fill="currentColor">
    <path d="M5 2c-0.828 0-1.58 0.337-2.121 0.879s-0.879 1.293-0.879 2.121v14c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h14c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-14c0-0.828-0.337-1.58-0.879-2.121s-1.293-0.879-2.121-0.879zM5 4h14c0.276 0 0.525 0.111 0.707 0.293s0.293 0.431 0.293 0.707v14c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-14c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707v-14c0-0.276 0.111-0.525 0.293-0.707s0.431-0.293 0.707-0.293zM8 13h3v3c0 0.552 0.448 1 1 1s1-0.448 1-1v-3h3c0.552 0 1-0.448 1-1s-0.448-1-1-1h-3v-3c0-0.552-0.448-1-1-1s-1 0.448-1 1v3h-3c-0.552 0-1 0.448-1 1s0.448 1 1 1z"></path>
</svg>;
export function PlusSignSvg() { return _PlusSignSvg; }

const _HelpCircleSvg = <svg
    viewBox='0 0 24 24'
    width='1em'
    height='1em'
    fill='currentColor'>
    <path d='M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z'/>
</svg>;
export function HelpCircleSvg() { return _HelpCircleSvg; }

const _WarningSvg = <svg
    viewBox="0 0 16 16"
    width="14"
    height="14"
    fill="currentColor">
    <path d="M8 1.45l6.705 13.363h-13.409l6.705-13.363zM8 0c-0.345 0-0.69 0.233-0.951 0.698l-6.829 13.611c-0.523 0.93-0.078 1.691 0.989 1.691h13.583c1.067 0 1.512-0.761 0.989-1.691h0l-6.829-13.611c-0.262-0.465-0.606-0.698-0.951-0.698v0z"></path>
    <path d="M9 13c0 0.552-0.448 1-1 1s-1-0.448-1-1c0-0.552 0.448-1 1-1s1 0.448 1 1z"></path>
    <path d="M8 11c-0.552 0-1-0.448-1-1v-3c0-0.552 0.448-1 1-1s1 0.448 1 1v3c0 0.552-0.448 1-1 1z"></path>
</svg>;
export function WarningSvg() { return _WarningSvg; }

const _CopySvg = <svg
    viewBox="0 0 24 24"
    strokeWidth='0.1px'
    width="1em"
    height="1em"
    fill="currentColor">
    <path d="M18.984 21v-14.016h-10.969v14.016h10.969zM18.984 5.016q0.797 0 1.406 0.586t0.609 1.383v14.016q0 0.797-0.609 1.406t-1.406 0.609h-10.969q-0.797 0-1.406-0.609t-0.609-1.406v-14.016q0-0.797 0.609-1.383t1.406-0.586h10.969zM15.984 0.984v2.016h-12v14.016h-1.969v-14.016q0-0.797 0.586-1.406t1.383-0.609h12z"/>
</svg>;
export function CopySvg() { return _CopySvg; }

const _DownloadSvg = <svg
    id="download"
    viewBox="0 0 22 22"
    focusable="false"
    data-icon="download"
    strokeWidth='0.1px'
    width="1em"
    height="1em"
    fill="currentColor">
    <path d="M19 12v7H5v-7H3v9h18v-9h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
</svg>;
export function DownloadSvg() { return _DownloadSvg; }

const _EyeSvg = <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor">
    <path d="M8 3c-3.489 0-6.514 2.032-8 5 1.486 2.968 4.511 5 8 5s6.514-2.032 8-5c-1.486-2.968-4.511-5-8-5zM11.945 5.652c0.94 0.6 1.737 1.403 2.335 2.348-0.598 0.946-1.395 1.749-2.335 2.348-1.181 0.753-2.545 1.152-3.944 1.152s-2.763-0.398-3.945-1.152c-0.94-0.6-1.737-1.403-2.335-2.348 0.598-0.946 1.395-1.749 2.335-2.348 0.061-0.039 0.123-0.077 0.185-0.114-0.156 0.427-0.241 0.888-0.241 1.369 0 2.209 1.791 4 4 4s4-1.791 4-4c0-0.481-0.085-0.942-0.241-1.369 0.062 0.037 0.124 0.075 0.185 0.114v0zM8 6.5c0 0.828-0.672 1.5-1.5 1.5s-1.5-0.672-1.5-1.5 0.672-1.5 1.5-1.5 1.5 0.672 1.5 1.5z"></path>
</svg>;
export function EyeSvg() { return _EyeSvg; }

const _EyeSvgBlocked = <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="currentColor">
    <path d="M14.78 0.22c-0.293-0.293-0.768-0.293-1.061 0l-3.159 3.159c-0.812-0.246-1.671-0.378-2.561-0.378-3.489 0-6.514 2.032-8 5 0.643 1.283 1.573 2.391 2.703 3.236l-2.484 2.484c-0.293 0.293-0.293 0.768 0 1.061 0.146 0.146 0.338 0.22 0.53 0.22s0.384-0.073 0.53-0.22l13.5-13.5c0.293-0.293 0.293-0.768 0-1.061zM6.5 5c0.66 0 1.22 0.426 1.421 1.019l-1.902 1.902c-0.592-0.201-1.019-0.761-1.019-1.421 0-0.828 0.672-1.5 1.5-1.5zM1.721 8c0.598-0.946 1.395-1.749 2.335-2.348 0.061-0.039 0.123-0.077 0.185-0.114-0.156 0.427-0.241 0.888-0.241 1.369 0 0.858 0.27 1.652 0.73 2.303l-0.952 0.952c-0.819-0.576-1.519-1.311-2.057-2.162z"></path>
    <path d="M12 6.906c0-0.424-0.066-0.833-0.189-1.217l-5.028 5.028c0.384 0.123 0.793 0.189 1.217 0.189 2.209 0 4-1.791 4-4z"></path>
    <path d="M12.969 4.531l-1.084 1.084c0.020 0.012 0.040 0.024 0.059 0.037 0.94 0.6 1.737 1.403 2.335 2.348-0.598 0.946-1.395 1.749-2.335 2.348-1.181 0.753-2.545 1.152-3.944 1.152-0.604 0-1.202-0.074-1.781-0.219l-1.201 1.201c0.933 0.335 1.937 0.518 2.982 0.518 3.489 0 6.514-2.032 8-5-0.703-1.405-1.752-2.6-3.031-3.469z"></path>
</svg>;
export function EyeSvgBlocked() { return _EyeSvgBlocked; }