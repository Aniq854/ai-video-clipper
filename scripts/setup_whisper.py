"""
ClipAI — Whisper Setup Verification Script
Run: python scripts/setup_whisper.py
"""
import sys
import subprocess
import platform

def check_python_version():
    version = sys.version_info
    print(f"✅ Python Version: {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print("❌ Python 3.9+ required! Please upgrade.")
        return False
    return True

def check_whisper_installed():
    try:
        import whisper
        print(f"✅ OpenAI Whisper installed: {whisper.__version__}")
        return True
    except ImportError:
        print("❌ OpenAI Whisper not installed!")
        print("   Install with: pip install openai-whisper")
        return False

def check_ffmpeg():
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True, text=True, timeout=10
        )
        first_line = result.stdout.split('\n')[0] if result.stdout else "Unknown"
        print(f"✅ FFmpeg installed: {first_line}")
        return True
    except (FileNotFoundError, subprocess.TimeoutExpired):
        print("❌ FFmpeg not found!")
        print("   Install FFmpeg: https://ffmpeg.org/download.html")
        return False

def check_gpu():
    try:
        import torch
        if torch.cuda.is_available():
            gpu_name = torch.cuda.get_device_name(0)
            print(f"✅ GPU Available: {gpu_name} (CUDA)")
            print("   🚀 Whisper will use GPU for fast transcription!")
        else:
            print("⚠️  No CUDA GPU detected — Whisper will use CPU (slower)")
            print("   Tip: 'base' model works well on CPU")
    except ImportError:
        print("⚠️  PyTorch not found — Whisper will use CPU")
        print("   For GPU support: pip install torch")

def download_model(model_name="base"):
    try:
        import whisper
        print(f"\n📥 Downloading Whisper '{model_name}' model...")
        whisper.load_model(model_name)
        print(f"✅ Model '{model_name}' ready!")
        return True
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return False

def main():
    print("=" * 50)
    print("  ClipAI — Whisper Setup Verification")
    print("=" * 50)
    print(f"\n🖥️  System: {platform.system()} {platform.release()}")
    print(f"📐 Architecture: {platform.machine()}\n")

    all_ok = True
    all_ok &= check_python_version()
    all_ok &= check_whisper_installed()
    all_ok &= check_ffmpeg()
    check_gpu()

    if all_ok:
        print("\n" + "=" * 50)
        print("✅ All checks passed! Ready to use ClipAI.")
        print("=" * 50)
        
        # Ask to download model
        model = input("\nDownload Whisper model? (tiny/base/small/medium/large) [base]: ").strip() or "base"
        download_model(model)
    else:
        print("\n" + "=" * 50)
        print("❌ Some checks failed. Please fix the issues above.")
        print("=" * 50)
        sys.exit(1)

if __name__ == "__main__":
    main()
