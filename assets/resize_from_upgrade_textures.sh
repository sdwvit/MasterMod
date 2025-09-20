resize_from_upgrade_textures() {
    local pattern="${1:-*}"
    local dims="${2:-258x388}"
    local crop_dims="${3:-}"

    # If only one number passed, make it square
    if [[ "$dims" =~ ^[0-9]+$ ]]; then
        dims="${dims}x${dims}"
    fi

    # If only one number passed, make it square
    if [[ "$crop_dims" =~ ^[0-9]+$ ]]; then
        crop_dims="${crop_dims}x${crop_dims}"
    fi

    local width=$(echo "$dims" | cut -dx -f1)
    local height=$(echo "$dims" | cut -dx -f2)

    # If crop is specified, use it
    if [[ -n "$crop_dims" ]]; then
        local crop_w=$(echo "$crop_dims" | cut -dx -f1)
        local crop_h=$(echo "$crop_dims" | cut -dx -f2)
        local crop_filter="crop=${crop_w}:${crop_h}:((iw-ow)/2):((ih-oh)/2)"
    else
        local crop_w=$(echo "$dims" | cut -dx -f1)
        local crop_h=$(echo "$dims" | cut -dx -f2)
        local crop_filter="crop=${crop_w}:${crop_h}:((iw-ow)/2):((ih-oh)/2)"
    fi

    for f in ${pattern}_upgrade.PNG ${pattern}_upgrade.png; do
        [[ -f "$f" ]] || continue
        out="${f/_upgrade/}"

        # Build the filter chain
        local filter_chain="scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=00000000"
        [[ -n "$crop_filter" ]] && filter_chain="${filter_chain},${crop_filter}"

        ffmpeg -y -i "$f" \
            -vf "$filter_chain" \
            -c:a copy \
            "$out"
    done

    echo
    echo "✅ Finished resizing (centered, transparent padding, optional crop)."
    echo "Usage: resize_from_upgrade_textures [pattern] [dimensions] [crop_dimensions]"
    echo "  pattern: defaults to *"
    echo "  dimensions: defaults to 258x388, or pass single number (e.g. 256) for square"
    echo "  crop_dimensions: optional (e.g. 256x256) to crop after scaling/padding"
    echo "                   If omitted, no crop is applied."
}
